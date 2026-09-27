import { useSyncExternalStore } from 'react'
import { mockBillingClient, NO_SUBSCRIPTION } from '@/lib/billing/mock'
import type { BillingClient } from '@/lib/billing/types'

// Swap point: replace with the Paddle implementation once connected.
export const billingClient: BillingClient = mockBillingClient

export function useSubscription() {
  return useSyncExternalStore(
    billingClient.subscribe,
    billingClient.getSubscription,
    () => NO_SUBSCRIPTION,
  )
}
