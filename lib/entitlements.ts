import { useCallback } from 'react'
import useSWR from 'swr'
import { useAuthState } from '@/lib/auth/client'
import type { PlanId } from '@/lib/billing/types'
import type { Mandala } from '@/lib/mandalas'
import { createClient } from '@/lib/supabase/client'

export type Membership = Readonly<{ endsAt: Date | null }>

export type Rights = Readonly<{ membership: Membership | null; packs: ReadonlySet<string> }>

type EntitlementRow = {
  scope: 'membership' | 'pack'
  pack_id: string | null
  starts_at: string
  ends_at: string | null
}

const NO_PACKS: ReadonlySet<string> = new Set()

/** Folds the parent's entitlement rows into the rights that are active at `now`. */
export function activeRights(rows: readonly EntitlementRow[], now: number): Rights {
  const active = rows.filter(
    (row) => Date.parse(row.starts_at) <= now && (!row.ends_at || Date.parse(row.ends_at) > now),
  )
  const memberships = active.filter((row) => row.scope === 'membership')
  const packs = new Set(active.flatMap((row) => (row.scope === 'pack' && row.pack_id ? [row.pack_id] : [])))

  let membership: Membership | null = null
  if (memberships.some((row) => !row.ends_at)) membership = { endsAt: null }
  else if (memberships.length > 0) {
    membership = { endsAt: new Date(Math.max(...memberships.map((row) => Date.parse(row.ends_at!)))) }
  }
  return { membership, packs }
}

/** Free pages are open to everyone; paid pages need a plan, or the pack they belong to. */
export function canColor(mandala: Pick<Mandala, 'tier' | 'pack'>, rights: Rights) {
  if (mandala.tier === 'free' || rights.membership) return true
  return mandala.pack !== null && rights.packs.has(mandala.pack)
}

async function fetchRights([, parentId]: readonly [string, string]): Promise<Rights> {
  const { data, error } = await createClient()
    .from('entitlements')
    .select('scope, pack_id, starts_at, ends_at')
    .eq('parent_id', parentId)
    .is('revoked_at', null)
  if (error) {
    console.error('Loading plan failed', error.code)
    throw new Error('We couldn’t check your plan right now.')
  }
  return activeRights(data as EntitlementRow[], Date.now())
}

/**
 * Plan and pack rights come only from entitlement rows written by the billing server. Nothing
 * on this device can grant them: guests and signed-out devices always get the free flowers.
 */
export function useEntitlements() {
  const auth = useAuthState()
  const parentId = auth.user?.id ?? null
  const { data, error } = useSWR(parentId ? (['entitlements', parentId] as const) : null, fetchRights, {
    revalidateOnFocus: true,
  })
  const membership = parentId ? (data?.membership ?? null) : null
  const packs = parentId ? (data?.packs ?? NO_PACKS) : NO_PACKS
  const hasFamily = membership !== null
  const ready = auth.status === 'signed-out' || (auth.status === 'signed-in' && (data !== undefined || !!error))

  const isUnlocked = useCallback(
    (mandala: Pick<Mandala, 'tier' | 'pack'>) => canColor(mandala, { membership, packs }),
    [membership, packs],
  )

  const plan: PlanId = hasFamily ? 'family' : 'free'
  return { plan, hasFamily, membership, packs, ready, failed: !!error && data === undefined, isUnlocked }
}
