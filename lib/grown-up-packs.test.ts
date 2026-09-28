import { describe, expect, it } from 'vitest'
import { safeNext } from '@/lib/auth/redirect'
import {
  GROWN_UP_PACKS,
  GROWN_UPS_HREF,
  KIDS_PACKS,
  PACKS,
  PACK_BY_ID,
  colorHref,
  findKidsPack,
  packHref,
} from '@/lib/packs'

describe('grown-up packs', () => {
  it('splits every listed pack into exactly one shelf', () => {
    expect(KIDS_PACKS.every((p) => p.audience === 'children')).toBe(true)
    expect(GROWN_UP_PACKS.every((p) => p.audience === 'grown-ups')).toBe(true)
    expect(KIDS_PACKS.length + GROWN_UP_PACKS.length).toBe(PACKS.length)
  })

  it('keeps Zen Mandalas off the kids shelf and behind the parent gate', () => {
    const zen = PACK_BY_ID['zen-mandalas']
    expect(zen.audience).toBe('grown-ups')
    expect(findKidsPack(zen.id)).toBeUndefined()
    expect(packHref(zen.id)).toBe(GROWN_UPS_HREF)

    const page = colorHref({ id: 'lotus-bloom', pack: zen.id })
    expect(page).toBe('/parent/color/lotus-bloom')
    expect(safeNext(page)).toBe(page)
  })

  it('leaves children pages in the kids area', () => {
    expect(colorHref({ id: 'daisy', pack: 'standard' })).toBe('/color/daisy')
    expect(packHref('standard')).toBe('/packs/standard')
    expect(findKidsPack('standard')?.id).toBe('standard')
  })
})
