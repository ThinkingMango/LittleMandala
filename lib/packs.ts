import { MANDALAS, type Mandala } from '@/lib/mandalas'

export type PackId = 'standard' | 'ocean-friends'

export type Pack = Readonly<{
  /** For packs sold separately, this matches `entitlements.pack_id`, written by the billing server. */
  id: PackId
  name: string
  description: string
  /** Where the artwork came from, kept with the pack as its art record. */
  artSource: string
  /**
   * Whether the pack can be bought once on its own. Paid pages in other packs unlock only with a plan,
   * even if an entitlement row names that pack.
   */
  soldSeparately: boolean
}>

export const PACK_BY_ID: Readonly<Record<PackId, Pack>> = Object.freeze({
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Ten flower mandalas. Four are free for everyone, and six more open with the Family plan.',
    artSource: 'Original geometric artwork drawn in code for Little Mandala. No third-party images or licenses are used.',
    soldSeparately: false,
  },
  'ocean-friends': {
    id: 'ocean-friends',
    name: 'Ocean Friends',
    description:
      'Sixteen sea friends: a flower fish and turtle, a shell with a pearl, a starfish, an octopus, a puffer fish, a whale, a crab, a seahorse, a jellyfish, a dolphin, a seal pup, a clownfish, a stingray, an otter and a friendly shark.',
    artSource:
      'Original line art made for Little Mandala with v0 image generation, then traced into tap-to-fill areas by scripts/trace-pack.mjs. Each source image is kept in art/ocean-friends/source with its checksum. No third-party images or licenses are used.',
    soldSeparately: true,
  },
})

/** Every pack, in the order children see them. */
export const PACKS: readonly Pack[] = Object.freeze([PACK_BY_ID.standard, PACK_BY_ID['ocean-friends']])

/** Packs a parent can buy once, outside the Family plan. */
export const SOLD_PACKS: readonly Pack[] = Object.freeze(PACKS.filter((p) => p.soldSeparately))

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
