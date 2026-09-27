export type PlanId = 'free' | 'family'

export type Plan = {
  id: PlanId
  name: string
  priceLabel: string
  cadence: string
  summary: string
  features: string[]
}

export type Subscription = {
  plan: PlanId
  status: 'active' | 'none'
  since: string | null
}

/**
 * The contract the app codes against. The mock implements it today;
 * a Paddle.js overlay checkout plus webhook-backed implementation will replace it.
 */
export interface BillingClient {
  readonly provider: 'paddle'
  readonly connected: boolean
  getSubscription: () => Subscription
  subscribe: (listener: () => void) => () => void
  completeCheckout: (plan: PlanId, customerEmail: string) => Promise<Subscription>
  cancel: () => Promise<void>
}
