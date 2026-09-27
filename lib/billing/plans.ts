import type { Plan, PlanId } from '@/lib/billing/types'

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    cadence: 'forever',
    summary: 'A handful of flowers to start with.',
    features: ['4 flower mandalas', 'All six colors', 'Artwork saved on this device'],
  },
  family: {
    id: 'family',
    name: 'Family',
    priceLabel: '$3.99',
    cadence: 'per month · placeholder price',
    summary: 'Every flower, plus new ones as they bloom.',
    features: [
      'All 10 flower mandalas',
      'New flowers added regularly',
      'Covers the whole household',
      'Cancel any time',
    ],
  },
}
