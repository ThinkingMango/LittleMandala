import type { Drawing, Region, TemplateDefinition } from '@/lib/mandalas'
import type { PackIconName } from '@/lib/pack-icons'
import type { PackId } from '@/lib/packs'
import { EARLIER_DRAWINGS } from '@/lib/templates/earlier-drawings'
import { TRACED_PACK_SOURCES } from '@/lib/templates/registry.generated'

export type PackStatus = 'draft' | 'published'

export type TracedArt = {
  id: string
  name: string
  line?: string
  regions: Region[]
  details: { kind: string; d: string }[]
}

/** A pack made from art/<pack>, as listed in the generated registry. */
export type TracedPackSource = Readonly<{
  id: string
  name: string
  description: string
  icon: PackIconName
  status: PackStatus
  pages: readonly TracedArt[]
}>

export type TracedPack = Omit<TracedPackSource, 'id'> & { id: (typeof TRACED_PACK_SOURCES)[number]['id'] }

/**
 * Draft packs are listed while developing, including in the v0 preview, so they can be tried before
 * they're published. Production builds and tests only list published packs.
 */
export const SHOW_DRAFT_PACKS = process.env.NODE_ENV === 'development'

export const TRACED_PACKS: readonly TracedPack[] = TRACED_PACK_SOURCES

export const LISTED_TRACED_PACKS: readonly TracedPack[] = TRACED_PACKS.filter(
  (pack) => pack.status === 'published' || SHOW_DRAFT_PACKS,
)

/** A page made by `pnpm packs trace` from its source image in art/<pack>/source. */
export function traced(art: TracedArt): Drawing {
  return {
    regions: art.regions.map(({ id, label, d }) => ({ id, label, d })),
    details: art.details.map(({ kind, d }) => ({ kind: kind === 'line' ? 'line' : 'dot', d })),
    ...(art.line === 'fine' && { line: 'fine' as const }),
  }
}

/**
 * A Family page in a traced pack. Earlier drawings for pages that shipped before their traced art stay
 * as the first versions, so saved artwork keeps opening on the version it was started on.
 */
export function tracedPage(pack: PackId, art: TracedArt, earlier: readonly Drawing[] = []): TemplateDefinition {
  return {
    id: art.id,
    name: art.name,
    tier: 'family',
    pack,
    versions: [...earlier, traced(art)].map((drawing, index) => ({ version: index + 1, drawing })),
  }
}

export function listedTracedPages(): TemplateDefinition[] {
  return LISTED_TRACED_PACKS.flatMap((pack) =>
    pack.pages.map((art) => tracedPage(pack.id, art, EARLIER_DRAWINGS[art.id])),
  )
}
