export type PlanId = 'free' | 'family'

export type Plan = {
  id: PlanId
  name: string
  priceLabel: string
  cadence: string
  summary: string
  features: string[]
}
