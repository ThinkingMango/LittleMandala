import { describe, expect, it } from 'vitest'
import { activeRights, canColor } from '@/lib/entitlements'
import { latestVersion } from '@/lib/mandalas'
import { PACKS, packPages } from '@/lib/packs'

const NOW = Date.parse('2026-09-27T12:00:00Z')
const row = (scope: 'membership' | 'pack', pack_id: string | null, ends_at: string | null = null) => ({
  scope,
  pack_id,
  starts_at: '2026-09-01T00:00:00Z',
  ends_at,
})

describe('Ocean Friends pack', () => {
  const pages = packPages('ocean-friends')

  it('publishes exactly the eight planned pictures, each with an art record', () => {
    expect(pages.map((p) => p.id)).toEqual([
      'fish-flower',
      'turtle-flower',
      'shell-bloom',
      'starfish-waves',
      'octopus-hug',
      'puffer-bloom',
      'whale-circle',
      'crab-cove',
    ])
    expect(PACKS.find((p) => p.id === 'ocean-friends')?.artSource).toMatch(/original/i)
  })

  it('keeps every page within the beginner and second-level region range', () => {
    for (const page of pages) {
      const count = latestVersion(page).regions.length
      expect(count, page.id).toBeGreaterThanOrEqual(6)
      expect(count, page.id).toBeLessThanOrEqual(24)
    }
  })

  it('draws every region and detail inside the page with no broken numbers', () => {
    for (const page of pages) {
      const version = latestVersion(page)
      for (const d of [...version.regions, ...version.details].map((x) => x.d)) {
        const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
        expect(d, page.id).not.toMatch(/NaN|Infinity/)
        expect(Math.min(...numbers), page.id).toBeGreaterThanOrEqual(0)
        expect(Math.max(...numbers), page.id).toBeLessThanOrEqual(1000)
      }
    }
  })
})

describe('pack rights', () => {
  const ocean = packPages('ocean-friends')[0]

  it('unlocks a pack page with a Family plan or with that pack, but not with nothing', () => {
    expect(canColor(ocean, activeRights([], NOW))).toBe(false)
    expect(canColor(ocean, activeRights([row('membership', null)], NOW))).toBe(true)
    expect(canColor(ocean, activeRights([row('pack', 'ocean-friends')], NOW))).toBe(true)
  })

  it('does not treat a pack as a plan, and ignores expired rows', () => {
    const packOnly = activeRights([row('pack', 'ocean-friends')], NOW)
    expect(packOnly.membership).toBeNull()
    expect(canColor({ tier: 'family', pack: null }, packOnly)).toBe(false)

    const expired = activeRights([row('pack', 'ocean-friends', '2026-09-20T00:00:00Z')], NOW)
    expect(canColor(ocean, expired)).toBe(false)
  })
})
