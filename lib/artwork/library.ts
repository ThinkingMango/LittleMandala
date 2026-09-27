import type { TemplateSource, TemplateVersion } from '@/lib/mandalas'
import { PALETTE, type ColorKey } from '@/lib/palette'

export type Fills = Readonly<Record<string, ColorKey>>

export type Artwork = Readonly<{
  id: string
  templateId: string
  templateVersion: number
  fills: Fills
  createdAt: number
  updatedAt: number
}>

export type LibraryState = Readonly<{
  artworks: Readonly<Record<string, Artwork>>
  /** templateId → artworkId currently being colored for that flower. */
  drafts: Readonly<Record<string, string>>
  /** Explicitly saved artwork, newest first. Autosave never writes this. */
  gallery: readonly Artwork[]
}>

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const STORAGE_KEYS = Object.freeze({
  artworks: 'lm:v2:artworks',
  drafts: 'lm:v2:drafts',
  gallery: 'lm:v2:gallery',
})

const KEY_LIST = [STORAGE_KEYS.artworks, STORAGE_KEYS.drafts, STORAGE_KEYS.gallery] as const

export const EMPTY_FILLS: Fills = Object.freeze({})

export const EMPTY_STATE: LibraryState = Object.freeze({
  artworks: Object.freeze({}),
  drafts: Object.freeze({}),
  gallery: Object.freeze([]),
})

const COLOR_KEYS = new Set<string>(PALETTE.map((c) => c.key))

export function isColorKey(value: unknown): value is ColorKey {
  return typeof value === 'string' && COLOR_KEYS.has(value)
}

export function newArtworkId() {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') return `art_${cryptoApi.randomUUID()}`
  const bytes = new Uint8Array(16)
  cryptoApi.getRandomValues(bytes)
  return `art_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

/** Keeps only approved regions of the pinned version, painted with a real palette color. */
export function sanitizeFills(value: unknown, version: TemplateVersion): Fills {
  if (!isRecord(value)) return EMPTY_FILLS
  const clean: Record<string, ColorKey> = {}
  for (const regionId of version.approvedRegionIds) {
    const color = value[regionId]
    if (isColorKey(color)) clean[regionId] = color
  }
  return Object.freeze(clean)
}

export function selectDraft(state: LibraryState, templateId: string): Artwork | null {
  const id = state.drafts[templateId]
  return id ? (state.artworks[id] ?? null) : null
}

type LegacyImport = { templateIds: readonly string[]; key: (templateId: string) => string }

type LibraryOptions = {
  storage: () => KeyValueStorage | null
  templates: TemplateSource
  newId?: () => string
  now?: () => number
  /** One-time import of pre-v2 `lm:art:<templateId>` fills, which were all template v1. */
  legacy?: LegacyImport
}

type Write = [key: string, value: unknown]

export type ArtworkLibrary = ReturnType<typeof createArtworkLibrary>

export function createArtworkLibrary({
  storage,
  templates,
  newId = newArtworkId,
  now = Date.now,
  legacy,
}: LibraryOptions) {
  const listeners = new Set<() => void>()
  let lastRaws: (string | null)[] | null = null
  let cached: LibraryState = EMPTY_STATE
  let legacyChecked = false

  const safeStorage = () => {
    try {
      return storage()
    } catch {
      return null
    }
  }

  const notify = () => listeners.forEach((l) => l())

  const readRawMap = (s: KeyValueStorage, key: string): Record<string, unknown> => {
    const value = parseJson(s.getItem(key))
    return isRecord(value) ? { ...value } : {}
  }

  const readRawList = (s: KeyValueStorage, key: string): string[] => {
    const value = parseJson(s.getItem(key))
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
  }

  /** `null` removes the key. Artwork records are always written before anything that points at them. */
  const writeRaw = (s: KeyValueStorage, writes: Write[]) => {
    try {
      for (const [key, value] of writes) {
        if (value === null) s.removeItem(key)
        else s.setItem(key, JSON.stringify(value))
      }
      return true
    } catch {
      return false
    }
  }

  const commit = (writes: Write[]) => {
    const s = safeStorage()
    if (!s) return false
    const ok = writeRaw(s, writes)
    notify()
    return ok
  }

  const toArtwork = (id: string, value: unknown): Artwork | null => {
    if (!isRecord(value) || value.id !== id) return null
    const { templateId, templateVersion } = value
    if (typeof templateId !== 'string' || typeof templateVersion !== 'number') return null
    const version = templates.version(templateId, templateVersion)
    if (!version) return null
    return Object.freeze({
      id,
      templateId,
      templateVersion,
      fills: sanitizeFills(value.fills, version),
      createdAt: toNumber(value.createdAt),
      updatedAt: toNumber(value.updatedAt),
    })
  }

  const buildState = ([rawArtworks, rawDrafts, rawGallery]: (string | null)[]): LibraryState => {
    const artworks: Record<string, Artwork> = {}
    const parsedArtworks = parseJson(rawArtworks)
    if (isRecord(parsedArtworks)) {
      for (const [id, value] of Object.entries(parsedArtworks)) {
        const artwork = toArtwork(id, value)
        if (artwork) artworks[id] = artwork
      }
    }

    const drafts: Record<string, string> = {}
    const parsedDrafts = parseJson(rawDrafts)
    if (isRecord(parsedDrafts)) {
      for (const [templateId, id] of Object.entries(parsedDrafts)) {
        if (typeof id === 'string' && artworks[id]?.templateId === templateId) drafts[templateId] = id
      }
    }

    const gallery: Artwork[] = []
    const parsedGallery = parseJson(rawGallery)
    if (Array.isArray(parsedGallery)) {
      const seen = new Set<string>()
      for (const id of parsedGallery) {
        if (typeof id !== 'string' || seen.has(id) || !artworks[id]) continue
        seen.add(id)
        gallery.push(artworks[id])
      }
    }

    return Object.freeze({
      artworks: Object.freeze(artworks),
      drafts: Object.freeze(drafts),
      gallery: Object.freeze(gallery),
    })
  }

  const importLegacy = (s: KeyValueStorage) => {
    if (legacyChecked || !legacy) return
    legacyChecked = true
    for (const templateId of legacy.templateIds) {
      const legacyKey = legacy.key(templateId)
      const raw = s.getItem(legacyKey)
      if (raw === null) continue
      const version = templates.version(templateId, 1)
      const drafts = readRawMap(s, STORAGE_KEYS.drafts)
      const fills = version ? sanitizeFills(parseJson(raw), version) : EMPTY_FILLS
      if (version && !drafts[templateId] && Object.keys(fills).length > 0) {
        const id = newId()
        const t = now()
        const artworks = readRawMap(s, STORAGE_KEYS.artworks)
        artworks[id] = { id, templateId, templateVersion: 1, fills, createdAt: t, updatedAt: t }
        drafts[templateId] = id
        if (!writeRaw(s, [[STORAGE_KEYS.artworks, artworks], [STORAGE_KEYS.drafts, drafts]])) continue
      }
      s.removeItem(legacyKey)
    }
  }

  const getState = (): LibraryState => {
    const s = safeStorage()
    if (!s) return EMPTY_STATE
    try {
      importLegacy(s)
      const raws = KEY_LIST.map((key) => s.getItem(key))
      if (lastRaws && raws.every((raw, i) => raw === lastRaws![i])) return cached
      lastRaws = raws
      cached = buildState(raws)
      return cached
    } catch {
      return EMPTY_STATE
    }
  }

  const getDraft = (templateId: string) => selectDraft(getState(), templateId)

  const createDraft = (templateId: string): Artwork | null => {
    const s = safeStorage()
    const version = templates.latest(templateId)
    if (!s || !version) return null
    const id = newId()
    const t = now()
    const artworks = readRawMap(s, STORAGE_KEYS.artworks)
    artworks[id] = { id, templateId, templateVersion: version.version, fills: {}, createdAt: t, updatedAt: t }
    const drafts = readRawMap(s, STORAGE_KEYS.drafts)
    drafts[templateId] = id
    if (!commit([[STORAGE_KEYS.artworks, artworks], [STORAGE_KEYS.drafts, drafts]])) return null
    return getState().artworks[id] ?? null
  }

  /**
   * Autosave. Update-only: it never creates a record and never touches gallery membership,
   * so an artwork that was removed cannot be brought back by a late save.
   */
  const setFills = (artworkId: string, fills: Fills): boolean => {
    const s = safeStorage()
    const current = getState().artworks[artworkId]
    if (!s || !current) return false
    const version = templates.version(current.templateId, current.templateVersion)
    if (!version) return false
    const artworks = readRawMap(s, STORAGE_KEYS.artworks)
    const record = artworks[artworkId]
    if (!isRecord(record)) return false
    artworks[artworkId] = { ...record, fills: sanitizeFills(fills, version), updatedAt: now() }
    return commit([[STORAGE_KEYS.artworks, artworks]])
  }

  /** Colors one region of this flower's draft, starting a new draft (new id, latest version) if needed. */
  const fillRegion = (templateId: string, regionId: string, color: ColorKey) => {
    if (!isColorKey(color)) return null
    const existing = getDraft(templateId)
    const version = existing
      ? templates.version(templateId, existing.templateVersion)
      : templates.latest(templateId)
    if (!version || !version.approvedRegionIds.includes(regionId)) return null
    const before = existing?.fills ?? EMPTY_FILLS
    if (before[regionId] === color) return null
    const draft = existing ?? createDraft(templateId)
    if (!draft || !setFills(draft.id, { ...before, [regionId]: color })) return null
    return { artworkId: draft.id, before }
  }

  /** Returns the fills that were cleared, so the caller can offer a one-step undo. */
  const clearArtwork = (artworkId: string): Fills | null => {
    const artwork = getState().artworks[artworkId]
    if (!artwork || Object.keys(artwork.fills).length === 0) return null
    return setFills(artworkId, EMPTY_FILLS) ? artwork.fills : null
  }

  const saveToGallery = (artworkId: string) => {
    const s = safeStorage()
    if (!s || !getState().artworks[artworkId]) return false
    const gallery = readRawList(s, STORAGE_KEYS.gallery)
    if (gallery.includes(artworkId)) return true
    return commit([[STORAGE_KEYS.gallery, [artworkId, ...gallery]]])
  }

  const isActiveDraft = (artworkId: string) => Object.values(getState().drafts).includes(artworkId)

  /** Drops gallery membership. A finished artwork is deleted; an open draft keeps autosaving as a draft only. */
  const removeFromGallery = (artworkId: string) => {
    const s = safeStorage()
    if (!s) return false
    const gallery = readRawList(s, STORAGE_KEYS.gallery)
    if (!gallery.includes(artworkId)) return false
    const writes: Write[] = []
    if (!isActiveDraft(artworkId)) {
      const artworks = readRawMap(s, STORAGE_KEYS.artworks)
      delete artworks[artworkId]
      writes.push([STORAGE_KEYS.artworks, artworks])
    }
    writes.unshift([STORAGE_KEYS.gallery, gallery.filter((id) => id !== artworkId)])
    return commit(writes)
  }

  /** Lets go of this flower's draft so the next visit starts a fresh artwork. */
  const finishDraft = (templateId: string) => {
    const s = safeStorage()
    const state = getState()
    const artworkId = state.drafts[templateId]
    if (!s || !artworkId) return false
    const drafts = readRawMap(s, STORAGE_KEYS.drafts)
    delete drafts[templateId]
    const writes: Write[] = [[STORAGE_KEYS.drafts, drafts]]
    if (!state.gallery.some((a) => a.id === artworkId)) {
      const artworks = readRawMap(s, STORAGE_KEYS.artworks)
      delete artworks[artworkId]
      writes.push([STORAGE_KEYS.artworks, artworks])
    }
    return commit(writes)
  }

  const clearAll = () => commit(KEY_LIST.map((key): Write => [key, null]))

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || (KEY_LIST as readonly string[]).includes(e.key)) listener()
    }
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
    }
  }

  return {
    templates,
    getState,
    subscribe,
    getDraft,
    fillRegion,
    setFills,
    clearArtwork,
    saveToGallery,
    removeFromGallery,
    finishDraft,
    clearAll,
  }
}

function parseJson(raw: string | null): unknown {
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
