import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { activeRights, canColor } from '@/lib/entitlements'
import { latestVersion } from '@/lib/mandalas'
import { PACK_BY_ID, packPages, type PackId } from '@/lib/packs'

const root = join(__dirname, '..', '..')
const GARDEN_PACKS: PackId[] = ['safari-garden', 'easter-garden', 'christmas-garden']

const NOW = Date.parse('2026-09-27T12:00:00Z')
const packRow = (pack_id: string) => ({ scope: 'pack' as const, pack_id, starts_at: '2026-09-01T00:00:00Z', ends_at: null })

describe.each(GARDEN_PACKS)('%s pack', (id) => {
  const manifest = JSON.parse(readFileSync(join(root, 'art', id, 'pages.json'), 'utf8'))
  const pages = packPages(id)

  it('publishes the sixteen pages from the art manifest, in order, as sold-separately Family pages', () => {
    expect(pages.map((p) => p.id)).toEqual(manifest.pages.map((p: { id: string }) => p.id))
    expect(pages).toHaveLength(16)
    expect(PACK_BY_ID[id].soldSeparately).toBe(true)
    expect(PACK_BY_ID[id].artSource).toContain(`art/${id}/source`)
    for (const page of pages) expect(page.tier, page.id).toBe('family')
  })

  it('shows reviewed traced art on every page, with its source image and spoken labels', () => {
    for (const page of pages) {
      const art = JSON.parse(readFileSync(join(root, 'lib/templates', id, `${page.id}.json`), 'utf8'))
      const version = latestVersion(page)
      expect(page.latestVersion, page.id).toBe(1)
      expect(version.regions.map((r) => r.id), page.id).toEqual(art.regions.map((r: { id: string }) => r.id))
      expect(existsSync(join(root, art.source.file)), page.id).toBe(true)
      expect(art.review.ok, page.id).toBe(true)
      expect(new Set(version.regions.map((r) => r.id)).size, page.id).toBe(version.regions.length)
      for (const region of version.regions) {
        expect(region.label.trim(), page.id).not.toBe('')
        expect(region.label, page.id).not.toMatch(/ area \d+$/)
      }
    }
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

  it('opens with its own pack, and not with a different pack', () => {
    const first = pages[0]
    expect(canColor(first, activeRights([packRow(id)], NOW))).toBe(true)
    const other = GARDEN_PACKS.find((p) => p !== id)!
    expect(canColor(first, activeRights([packRow(other)], NOW))).toBe(false)
    expect(canColor(first, activeRights([packRow('ocean-friends')], NOW))).toBe(false)
  })
})
