export type PetalShape = 'round' | 'almond' | 'pointy' | 'heart'
export type Tier = 'free' | 'family'

type Layer = {
  count: number
  shape: PetalShape
  /** Distance from the center where the petal starts. */
  r0: number
  /** Distance from the center where the petal tip ends. */
  r1: number
  /** 1 = neighbouring petals just touch. Lower leaves gaps. */
  fullness?: number
  /** Rotation offset as a fraction of one petal step (0.5 = between petals). */
  offset?: number
}

type MandalaDefinition = {
  id: string
  name: string
  tier: Tier
  layers: Layer[]
  centerRadius: number
}

export type Region = { id: string; d: string; label: string }

export type Mandala = {
  id: string
  name: string
  tier: Tier
  regions: Region[]
}

type Pt = [number, number]
type Segment = [Pt, Pt, Pt]

const CENTER = 500

/** Where each shape is widest, used to size petals so neighbours meet. */
const SHAPE_METRICS: Record<PetalShape, { peak: number; at: number }> = {
  round: { peak: 0.75, at: 0.6 },
  almond: { peak: 0.75, at: 0.5 },
  pointy: { peak: 0.6, at: 0.4 },
  heart: { peak: 0.8, at: 0.65 },
}

/** Right half of a petal pointing straight up, from base to tip (tip has x = 0). */
function rightHalf(shape: PetalShape, r0: number, r1: number, w: number): Segment[] {
  const h = r1 - r0
  switch (shape) {
    case 'round':
      return [
        [
          [w, -(r0 + 0.3 * h)],
          [w, -r1],
          [0, -r1],
        ],
      ]
    case 'almond':
      return [
        [
          [w, -(r0 + 0.2 * h)],
          [w, -(r0 + 0.8 * h)],
          [0, -r1],
        ],
      ]
    case 'pointy':
      return [
        [
          [w, -(r0 + 0.3 * h)],
          [w * 0.55, -(r0 + 0.8 * h)],
          [0, -r1],
        ],
      ]
    case 'heart':
      return [
        [
          [w, -(r0 + 0.3 * h)],
          [w * 1.05, -r1],
          [w * 0.5, -r1],
        ],
        [
          [w * 0.15, -r1],
          [0, -(r1 - 0.05 * h)],
          [0, -(r1 - 0.12 * h)],
        ],
      ]
  }
}

function mirrorToClosedPetal(start: Pt, right: Segment[]): Segment[] {
  const points: Pt[] = [start, ...right.flat()]
  const reversed = points
    .slice()
    .reverse()
    .map(([x, y]) => [-x, y] as Pt)
  const left: Segment[] = []
  for (let i = 1; i < reversed.length; i += 3) {
    left.push([reversed[i], reversed[i + 1], reversed[i + 2]])
  }
  return [...right, ...left]
}

function rotate([x, y]: Pt, angle: number): Pt {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [x * cos - y * sin + CENTER, x * sin + y * cos + CENTER]
}

const fmt = (n: number) => Math.round(n * 10) / 10

function toPath(start: Pt, segments: Segment[], angle: number) {
  const [sx, sy] = rotate(start, angle)
  const curves = segments
    .map((seg) =>
      seg
        .map((p) => rotate(p, angle))
        .map(([x, y]) => `${fmt(x)} ${fmt(y)}`)
        .join(' '),
    )
    .map((s) => `C ${s}`)
    .join(' ')
  return `M ${fmt(sx)} ${fmt(sy)} ${curves} Z`
}

function circlePath(r: number) {
  return `M ${CENTER - r} ${CENTER} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`
}

function layerNames(total: number) {
  if (total === 1) return ['Petal']
  if (total === 2) return ['Outer petal', 'Inner petal']
  return ['Outer petal', 'Middle petal', 'Inner petal']
}

function buildMandala(def: MandalaDefinition): Mandala {
  const names = layerNames(def.layers.length)
  const regions: Region[] = []

  def.layers.forEach((layer, layerIndex) => {
    const { count, shape, r0, r1, fullness = 1, offset = 0 } = layer
    const metrics = SHAPE_METRICS[shape]
    const widest = r0 + metrics.at * (r1 - r0)
    const w = (fullness * widest * Math.sin(Math.PI / count)) / metrics.peak
    const start: Pt = [0, -r0]
    const segments = mirrorToClosedPetal(start, rightHalf(shape, r0, r1, w))
    const step = (Math.PI * 2) / count

    for (let i = 0; i < count; i++) {
      regions.push({
        id: `l${layerIndex}-p${i}`,
        d: toPath(start, segments, step * (i + offset)),
        label: `${names[layerIndex]} ${i + 1}`,
      })
    }
  })

  regions.push({ id: 'center', d: circlePath(def.centerRadius), label: 'Flower center' })

  return { id: def.id, name: def.name, tier: def.tier, regions }
}

const DEFINITIONS: MandalaDefinition[] = [
  {
    id: 'sunny',
    name: 'Sunny',
    tier: 'free',
    layers: [{ count: 8, shape: 'round', r0: 40, r1: 450 }],
    centerRadius: 115,
  },
  {
    id: 'daisy',
    name: 'Daisy',
    tier: 'free',
    layers: [{ count: 12, shape: 'almond', r0: 60, r1: 455 }],
    centerRadius: 125,
  },
  {
    id: 'tulip',
    name: 'Tulip Star',
    tier: 'free',
    layers: [
      { count: 6, shape: 'heart', r0: 50, r1: 455 },
      { count: 6, shape: 'almond', r0: 50, r1: 300, offset: 0.5, fullness: 0.85 },
    ],
    centerRadius: 95,
  },
  {
    id: 'lotus',
    name: 'Lotus',
    tier: 'free',
    layers: [
      { count: 8, shape: 'pointy', r0: 50, r1: 460 },
      { count: 8, shape: 'round', r0: 50, r1: 310, offset: 0.5 },
    ],
    centerRadius: 95,
  },
  {
    id: 'starburst',
    name: 'Starburst',
    tier: 'family',
    layers: [
      { count: 10, shape: 'pointy', r0: 50, r1: 460 },
      { count: 5, shape: 'round', r0: 50, r1: 290 },
    ],
    centerRadius: 90,
  },
  {
    id: 'clover',
    name: 'Clover',
    tier: 'family',
    layers: [
      { count: 4, shape: 'heart', r0: 40, r1: 450 },
      { count: 4, shape: 'almond', r0: 40, r1: 400, offset: 0.5, fullness: 0.5 },
    ],
    centerRadius: 105,
  },
  {
    id: 'dahlia',
    name: 'Dahlia',
    tier: 'family',
    layers: [
      { count: 12, shape: 'round', r0: 50, r1: 460 },
      { count: 12, shape: 'round', r0: 50, r1: 340, offset: 0.5 },
      { count: 6, shape: 'round', r0: 40, r1: 220 },
    ],
    centerRadius: 75,
  },
  {
    id: 'snowbloom',
    name: 'Snowbloom',
    tier: 'family',
    layers: [
      { count: 6, shape: 'almond', r0: 60, r1: 460, fullness: 0.8 },
      { count: 6, shape: 'pointy', r0: 50, r1: 350, offset: 0.5 },
      { count: 6, shape: 'round', r0: 40, r1: 210 },
    ],
    centerRadius: 75,
  },
  {
    id: 'poppy',
    name: 'Poppy',
    tier: 'family',
    layers: [
      { count: 5, shape: 'round', r0: 40, r1: 450 },
      { count: 5, shape: 'heart', r0: 40, r1: 300, offset: 0.5 },
    ],
    centerRadius: 105,
  },
  {
    id: 'garden',
    name: 'Garden',
    tier: 'family',
    layers: [
      { count: 8, shape: 'heart', r0: 50, r1: 460 },
      { count: 8, shape: 'almond', r0: 50, r1: 360, offset: 0.5, fullness: 0.8 },
      { count: 8, shape: 'round', r0: 40, r1: 220 },
    ],
    centerRadius: 75,
  },
]

export const MANDALAS: Mandala[] = DEFINITIONS.map(buildMandala)

export function getMandala(id: string) {
  return MANDALAS.find((m) => m.id === id)
}
