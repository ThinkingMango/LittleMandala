import type { Drawing, Region, TemplateDefinition } from '@/lib/mandalas'
import type { PackId } from '@/lib/packs'

export type TracedArt = { id: string; name: string; regions: Region[]; details: { kind: string; d: string }[] }

/** A page made by `pnpm trace-pack` from its source image in art/<pack>/source. */
export function traced(art: TracedArt): Drawing {
  return {
    regions: art.regions.map(({ id, label, d }) => ({ id, label, d })),
    details: art.details.map(({ kind, d }) => ({ kind: kind === 'line' ? 'line' : 'dot', d })),
  }
}

/**
 * A Family page in a traced pack. Pass earlier drawings for pages that shipped before their traced
 * art, so saved artwork keeps opening on the version it was started on.
 */
export function tracedPage(pack: PackId, art: TracedArt, ...earlier: Drawing[]): TemplateDefinition {
  return {
    id: art.id,
    name: art.name,
    tier: 'family',
    pack,
    versions: [...earlier, traced(art)].map((drawing, index) => ({ version: index + 1, drawing })),
  }
}
