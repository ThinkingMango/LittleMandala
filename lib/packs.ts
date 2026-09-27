import { MANDALAS, type Mandala } from '@/lib/mandalas'
import type { PackIconName } from '@/lib/pack-icons'
import {
  LISTED_TRACED_PACKS,
  TRACED_PACKS,
  type PackAudience,
  type PackStatus,
  type TracedPack,
} from '@/lib/templates/traced'

/** Standard, plus every pack in art/. Add a pack with `pnpm packs new`; see art/README.md. */
export type PackId = 'standard' | TracedPack['id']

export type Pack = Readonly<{
  /** For packs sold separately, this matches `entitlements.pack_id`, written by the billing server. */
  id: PackId
  name: string
  description: string
  icon: PackIconName
  /** Draft packs are listed only while developing. */
  status: PackStatus
  audience: PackAudience
  /** Where the artwork came from, kept with the pack as its art record. */
  artSource: string
  /**
   * Whether the pack can be bought once on its own. Paid pages in other packs unlock only with a plan,
   * even if an entitlement row names that pack.
   */
  soldSeparately: boolean
}>

const STANDARD: Pack = {
  id: 'standard',
  name: 'Standard',
  description: 'Ten flower mandalas. Four are free for everyone, and six more open with a one-time unlock.',
  icon: 'flower-2',
  status: 'published',
  audience: 'children',
  artSource: 'Original geometric artwork drawn in code for Little Mandala. No third-party images or licenses are used.',
  soldSeparately: false,
}

function tracedPack(source: TracedPack): Pack {
  return {
    id: source.id,
    name: source.name,
    description: source.description,
    icon: source.icon,
    status: source.status,
    audience: source.audience ?? 'children',
    artSource: `Original line art made for Little Mandala with v0 image generation, then traced into tap-to-fill areas by scripts/trace-pack.mjs. Each source image is kept in art/${source.id}/source with its checksum. No third-party images or licenses are used.`,
    soldSeparately: true,
  }
}

/** Every pack, drafts included, so a page can always find its pack. */
export const PACK_BY_ID = Object.freeze(
  Object.fromEntries([STANDARD, ...TRACED_PACKS.map(tracedPack)].map((pack) => [pack.id, pack])),
) as Readonly<Record<PackId, Pack>>

/** The packs children see, in shelf order. */
export const PACKS: readonly Pack[] = Object.freeze([STANDARD, ...LISTED_TRACED_PACKS.map((p) => PACK_BY_ID[p.id])])

/** Published packs a parent can buy once, outside the Family plan. */
export const SOLD_PACKS: readonly Pack[] = Object.freeze(
  PACKS.filter((p) => p.soldSeparately && p.status === 'published'),
)

export function findPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id)
}

export function packHref(id: PackId) {
  return `/packs/${id}`
}

/** The published pages in a pack. Counts shown to parents always come from here. */
export function packPages(id: PackId): Mandala[] {
  return MANDALAS.filter((m) => m.pack === id)
}
