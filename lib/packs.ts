import { MANDALAS, type Mandala } from '@/lib/mandalas'

export type PackId = 'ocean-friends'

export type Pack = Readonly<{
  /** Matches `entitlements.pack_id`, which the billing server writes after a one-time purchase. */
  id: PackId
  name: string
  description: string
  /** Where the artwork came from, kept with the pack as its art record. */
  artSource: string
}>

export const PACKS: readonly Pack[] = Object.freeze([
  {
    id: 'ocean-friends',
    name: 'Ocean Friends',
    description:
      'Fish petals, a turtle whose shell is a flower, striped shells, a smiling starfish, an octopus, a puffer fish, whales and a crab.',
    artSource: 'Original geometric artwork drawn in code for Little Mandala. No third-party images or licenses are used.',
  },
])

/** The published pages in a pack. Counts shown to parents always come from here. */
export function packPages(id: PackId): Mandala[] {
  return MANDALAS.filter((m) => m.pack === id)
}
