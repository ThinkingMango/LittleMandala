import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { activeRights, canColor } from '@/lib/entitlements'
import { latestVersion } from '@/lib/mandalas'
import { PACK_ICON_NAMES } from '@/lib/pack-icons'
import { PACK_BY_ID, packPages, type PackId } from '@/lib/packs'
import { EARLIER_DRAWINGS } from '@/lib/templates/earlier-drawings'
import { REGISTRY_FILE, inspectPack, isPlaceholder, readManifests, readTraced, renderRegistry } from '@/scripts/pack/pack-files'
import { PAGE_RULES } from '@/scripts/trace-pack/segment'

const root = join(__dirname, '..', '..')
const manifests = readManifests(root)
const published = manifests.filter((m) => m.status === 'published')

const NOW = Date.parse('2026-09-27T12:00:00Z')
const packRow = (pack_id: string) => ({ scope: 'pack' as const, pack_id, starts_at: '2026-09-01T00:00:00Z', ends_at: null })

describe('pack registry', () => {
  it('matches art/*/pages.json and the traced pages (run pnpm packs sync if not)', () => {
    expect(readFileSync(join(root, REGISTRY_FILE), 'utf8')).toBe(renderRegistry(root))
  })

  it('gives every pack, drafts included, its folder name and a known icon', () => {
    for (const manifest of manifests) {
      expect(existsSync(join(root, 'art', manifest.pack, 'pages.json')), manifest.pack).toBe(true)
      expect(PACK_ICON_NAMES, manifest.pack).toContain(manifest.icon)
    }
  })
})

describe.each(published.map((m) => [m.pack, m] as const))('%s pack', (id, manifest) => {
  const pages = packPages(id as PackId)

  it('has finished every step of adding a pack', () => {
    const unfinished = inspectPack(root, manifest, manifests).steps.filter((step) => !step.done)
    expect(unfinished.map((step) => `${step.title}: ${step.detail}`)).toEqual([])
  })

  it('publishes the manifest pages, in order, as sold-separately Family pages', () => {
    const pack = PACK_BY_ID[id as PackId]
    expect(pages.map((p) => p.id)).toEqual(manifest.pages.map((p) => p.id))
    expect(pack).toMatchObject({ name: manifest.name, description: manifest.description, icon: manifest.icon, soldSeparately: true })
    expect(pack.artSource).toContain(`art/${id}/source`)
    for (const page of pages) expect(page.tier, page.id).toBe('family')
  })

  it('shows each traced drawing as the latest version, with its source image and spoken names', () => {
    for (const page of pages) {
      const art = readTraced(root, id, page.id)!
      const version = latestVersion(page)
      expect(page.latestVersion, page.id).toBe(1 + (EARLIER_DRAWINGS[page.id]?.length ?? 0))
      expect(version.regions.map((r) => [r.id, r.label]), page.id).toEqual(art.regions.map((r) => [r.id, r.label]))
      expect(existsSync(join(root, art.source.file)), page.id).toBe(true)
      for (const region of version.regions) expect(isPlaceholder(region.label), `${page.id} ${region.id}`).toBe(false)
    }
  })

  it('keeps every page within the beginner and second-level region range', () => {
    for (const page of pages) {
      const count = latestVersion(page).regions.length
      expect(count, page.id).toBeGreaterThanOrEqual(PAGE_RULES.minRegions)
      expect(count, page.id).toBeLessThanOrEqual(PAGE_RULES.maxRegions)
    }
  })

  it('draws every region and detail inside the page with no broken numbers', () => {
    for (const page of pages) {
      const version = latestVersion(page)
      for (const d of [...version.regions, ...(version.details ?? [])].map((x) => x.d)) {
        const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
        expect(d, page.id).not.toMatch(/NaN|Infinity/)
        expect(Math.min(...numbers), page.id).toBeGreaterThanOrEqual(0)
        expect(Math.max(...numbers), page.id).toBeLessThanOrEqual(1000)
      }
    }
  })

  it('opens with its own pack, and not with a different pack', () => {
    const first = pages[0]
    expect(canColor(first, activeRights([packRow(id)], NOW))).toBe(true)
    const other = published.find((m) => m.pack !== id)?.pack ?? 'standard'
    expect(canColor(first, activeRights([packRow(other)], NOW))).toBe(false)
  })
})

describe('earlier drawings', () => {
  it("keeps Ocean Friends' first eight pages on their code drawings as version 1, so saved artwork still opens", () => {
    const ocean = manifests.find((m) => m.pack === 'ocean-friends')!
    expect(Object.keys(EARLIER_DRAWINGS)).toEqual(ocean.pages.slice(0, 8).map((p) => p.id))
    for (const page of packPages('ocean-friends').slice(0, 8)) expect(page.versions[0].regions.length, page.id).toBeGreaterThan(0)
  })
})
