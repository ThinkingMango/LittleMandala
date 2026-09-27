import type { Plan, PlanId } from '@/lib/billing/types'
import { MANDALAS } from '@/lib/mandalas'
import { SOLD_PACKS } from '@/lib/packs'

const freeCount = MANDALAS.filter((m) => m.tier === 'free').length
const packNames = SOLD_PACKS.map((p) => p.name).join(', ')

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    cadence: 'forever',
    summary: 'A handful of flowers to start with.',
    features: [`${freeCount} flower pictures`, 'All six colors', 'Artwork saved on this device'],
  },
  family: {
    id: 'family',
    name: 'Family',
    priceLabel: '$3.99',
    cadence: 'per month · placeholder price',
    summary: 'Every picture, plus new ones as they bloom.',
    features: [
      `All ${MANDALAS.length} pictures, including ${packNames}`,
      'New pictures added regularly',
      'Covers the whole household',
      'Cancel any time',
    ],
  },
}
