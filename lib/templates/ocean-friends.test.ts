import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from '../../art/ocean-friends/pages.json'
import { activeRights, canColor } from '@/lib/entitlements'
import { MANDALAS, latestVersion } from '@/lib/mandalas'
import { PACKS, SOLD_PACKS, packPages } from '@/lib/packs'

const root = join(__dirname, '..', '..')

const NOW = Date.parse('2026-09-27T12:00:00Z')
const row = (scope: 'membership' | 'pack', pack_id: string | null, ends_at: string | null = null) => ({
  scope,
  pack_id,
  starts_at: '2026-09-01T00:00:00Z',
  ends_at,
})

describe('Ocean Friends pack', () => {
  const pages = packPages('ocean-friends')

  it('publishes the sixteen pages from the art manifest, in order, with an art record', () => {
    expect(pages.map((p) => p.id)).toEqual(manifest.pages.map((p) => p.id))
    expect(pages).toHaveLength(16)
    expect(PACKS.find((p) => p.id === 'ocean-friends')?.artSource).toMatch(/original/i)
  })

  it('shows traced art on every page, with a source image and spoken labels', () => {
    for (const page of pages) {
      const art = JSON.parse(readFileSync(join(root, 'lib/templates/ocean-friends', `${page.id}.json`), 'utf8'))
      expect(latestVersion(page).regions.map((r) => r.id), page.id).toEqual(art.regions.map((r: { id: string }) => r.id))
      expect(existsSync(join(root, art.source.file)), page.id).toBe(true)
      expect(art.review.ok, page.id).toBe(true)
      for (const region of latestVersion(page).regions) expect(region.label, page.id).not.toMatch(/ area \d+$/)
    }
  })

  it('keeps the first eight pages on their original drawing as version 1, so saved artwork still opens', () => {
    const shippedFirst = manifest.pages.slice(0, 8).map((p) => p.id)
    for (const page of pages) expect(page.latestVersion, page.id).toBe(shippedFirst.includes(page.id) ? 2 : 1)
  })

  it('keeps every page within the beginner and second-level region range', () => {
    for (const page of pages) {
      const count = latestVersion(page).regions.length
      expect(count, page.id).toBeGreaterThanOrEqual(10)
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
    expect(canColor({ tier: 'family', pack: 'standard' }, packOnly)).toBe(false)

    const expired = activeRights([row('pack', 'ocean-friends', '2026-09-20T00:00:00Z')], NOW)
    expect(canColor(ocean, expired)).toBe(false)
  })

  it('opens locked Standard pages only with a plan, never with a pack row', () => {
    const lockedStandard = packPages('standard').find((m) => m.tier === 'family')!
    expect(canColor(lockedStandard, activeRights([row('pack', 'standard')], NOW))).toBe(false)
    expect(canColor(lockedStandard, activeRights([row('membership', null)], NOW))).toBe(true)
  })
})

describe('pack catalog', () => {
  it('puts every page in exactly one known pack', () => {
    const packIds = new Set(PACKS.map((p) => p.id))
    for (const page of MANDALAS) expect(packIds.has(page.pack), page.id).toBe(true)
    expect(PACKS.reduce((n, p) => n + packPages(p.id).length, 0)).toBe(MANDALAS.length)
  })

  it('makes Standard 4 free and 6 locked pages, and sells every picture pack but Standard on its own', () => {
    const standard = packPages('standard')
    expect(standard.filter((m) => m.tier === 'free')).toHaveLength(4)
    expect(standard.filter((m) => m.tier === 'family')).toHaveLength(6)
    expect(SOLD_PACKS.map((p) => p.id)).toEqual(['ocean-friends', 'safari-garden', 'easter-garden', 'christmas-garden'])
  })

  it('gives every page a unique id across all packs', () => {
    expect(new Set(MANDALAS.map((m) => m.id)).size).toBe(MANDALAS.length)
  })
})
