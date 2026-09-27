import { createLocalStore } from '@/lib/local-store'
import type { BillingClient, Subscription } from '@/lib/billing/types'

const NO_SUBSCRIPTION: Subscription = { plan: 'free', status: 'none', since: null }

const subscriptionStore = createLocalStore<Subscription>('lm:mock:subscription', NO_SUBSCRIPTION)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockBillingClient: BillingClient = {
  provider: 'paddle',
  connected: false,
  getSubscription: subscriptionStore.read,
  subscribe: subscriptionStore.subscribe,
  async completeCheckout(plan) {
    await wait(700)
    const next: Subscription =
      plan === 'free'
        ? NO_SUBSCRIPTION
        : { plan, status: 'active', since: new Date().toISOString() }
    subscriptionStore.write(next)
    return next
  },
  async cancel() {
    await wait(400)
    subscriptionStore.write(NO_SUBSCRIPTION)
  },
}

export { NO_SUBSCRIPTION }
