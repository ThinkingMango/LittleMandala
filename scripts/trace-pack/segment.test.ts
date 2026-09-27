import { describe, expect, it } from 'vitest'
import { BACKGROUND, PAGE_RULES, checkPage, segment } from './segment'

const W = 200
const H = 200

/** A circle outline split in half by a line, with an eye dot in the top half and a tiny box in the bottom half. */
function drawFish() {
  const gray = new Uint8Array(W * H).fill(255)
  const ink = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < W && y < H) gray[y * W + x] = 0
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = Math.hypot(x - 100, y - 100)
      if (r >= 78 && r <= 82) ink(x, y)
      if (r < 80 && y >= 99 && y <= 101) ink(x, y)
      if (Math.hypot(x - 130, y - 70) <= 5) ink(x, y)
      const inBox = x >= 90 && x <= 96 && y >= 140 && y <= 146
      const boxEdge = x === 90 || x === 96 || y === 140 || y === 146
      if (inBox && boxEdge) ink(x, y)
    }
  }
  return gray
}

describe('segment', () => {
  const result = segment(drawFish(), W, H, { inkThreshold: 140, minAreaShare: 0.01 })

  it('turns each enclosed shape into an area and absorbs specks too small to tap', () => {
    expect(result.regions).toHaveLength(2)
    expect(result.absorbed).toBe(1)
    const [top, bottom] = [result.labels[60 * W + 100], result.labels[150 * W + 100]]
    expect(top).not.toBe(bottom)
    expect(result.labels[143 * W + 93]).toBe(bottom)
  })

  it('shares the outline between neighbouring areas so they meet edge to edge', () => {
    expect(result.labels[99 * W + 100]).not.toBe(BACKGROUND)
    expect(result.labels[101 * W + 100]).not.toBe(BACKGROUND)
    expect(result.labels[100 * W + 21]).not.toBe(BACKGROUND)
    expect(result.labels[5 * W + 5]).toBe(BACKGROUND)
  })

  it('keeps ink inside a single area as a detail drawn on top', () => {
    expect(result.detailMask[70 * W + 130]).toBe(1)
    expect(result.detailMask[100 * W + 100]).toBe(0)
    expect(result.detailMask[80 * W + 20]).toBe(0)
  })

  it('lists areas largest first with a measured thickness', () => {
    expect(result.regions[0].area).toBeGreaterThanOrEqual(result.regions[1].area)
    for (const region of result.regions) expect(region.thickness).toBeGreaterThan(40)
  })

  it('fails pages that break the art rules', () => {
    const check = checkPage(result)
    expect(check.ok).toBe(false)
    expect(check.problems[0]).toContain(`needs ${PAGE_RULES.minRegions}`)
  })

  it('treats an outline that leaks open as background, not an area', () => {
    const leaky = drawFish()
    for (let y = 90; y < 110; y++) for (let x = 176; x < 184; x++) leaky[y * W + x] = 255
    const opened = segment(leaky, W, H, { inkThreshold: 140, minAreaShare: 0.01 })
    expect(opened.regions).toHaveLength(0)
    expect(checkPage(opened).problems.some((p) => p.includes('background'))).toBe(true)
  })
})
