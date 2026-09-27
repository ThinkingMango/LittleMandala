import { useCallback } from 'react'
import { useSubscription } from '@/lib/billing/client'
import type { Mandala } from '@/lib/mandalas'

export function useEntitlements() {
  const subscription = useSubscription()
  const hasFamily = subscription.plan === 'family' && subscription.status === 'active'

  const isUnlocked = useCallback(
    (mandala: Pick<Mandala, 'tier'>) => mandala.tier === 'free' || hasFamily,
    [hasFamily],
  )

  return { plan: subscription.plan, hasFamily, isUnlocked }
}
