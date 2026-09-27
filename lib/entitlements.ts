import { useCallback } from 'react'
import useSWR from 'swr'
import { useAuthState } from '@/lib/auth/client'
import type { PlanId } from '@/lib/billing/types'
import type { Mandala } from '@/lib/mandalas'
import { createClient } from '@/lib/supabase/client'

export type Membership = Readonly<{ endsAt: Date | null }>

type MembershipRow = { starts_at: string; ends_at: string | null }

async function fetchMembership([, parentId]: readonly [string, string]): Promise<Membership | null> {
  const { data, error } = await createClient()
    .from('entitlements')
    .select('starts_at, ends_at')
    .eq('parent_id', parentId)
    .eq('scope', 'membership')
    .is('revoked_at', null)
  if (error) {
    console.error('Loading plan failed', error.code)
    throw new Error('We couldn’t check your plan right now.')
  }
  const now = Date.now()
  const active = (data as MembershipRow[]).filter(
    (row) => Date.parse(row.starts_at) <= now && (!row.ends_at || Date.parse(row.ends_at) > now),
  )
  if (active.length === 0) return null
  if (active.some((row) => !row.ends_at)) return { endsAt: null }
  return { endsAt: new Date(Math.max(...active.map((row) => Date.parse(row.ends_at!)))) }
}

/**
 * Plan rights come only from entitlement rows written by the billing server. Nothing on this
 * device can grant them: guests and signed-out devices always get the free flowers.
 */
export function useEntitlements() {
  const auth = useAuthState()
  const parentId = auth.user?.id ?? null
  const { data, error } = useSWR(parentId ? (['entitlements', parentId] as const) : null, fetchMembership, {
    revalidateOnFocus: true,
  })
  const membership = parentId ? (data ?? null) : null
  const hasFamily = membership !== null
  const ready = auth.status === 'signed-out' || (auth.status === 'signed-in' && (data !== undefined || !!error))

  const isUnlocked = useCallback(
    (mandala: Pick<Mandala, 'tier'>) => mandala.tier === 'free' || hasFamily,
    [hasFamily],
  )

  const plan: PlanId = hasFamily ? 'family' : 'free'
  return { plan, hasFamily, membership, ready, failed: !!error && data === undefined, isUnlocked }
}
