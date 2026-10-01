import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { useAuthState } from '@/lib/auth/client'
import { LIVE_PAYMENTS, countsInThisMode } from '@/lib/billing/mode'
import type { Mandala } from '@/lib/mandalas'
import { PACK_BY_ID, type PackId } from '@/lib/packs'
import { createClient } from '@/lib/supabase/client'

export type Rights = Readonly<{ packs: ReadonlySet<string> }>

type EntitlementRow = {
  scope: string
  pack_id: string | null
  /** The Checkout Session that paid for it (`cs_live_…`, `cs_test_…`) or `comp:…` for a gift. */
  source_id: string
  starts_at: string
  ends_at: string | null
}

const NO_PACKS: ReadonlySet<string> = new Set()

/**
 * `starts_at` is stamped by the database clock and `now` comes from the device. A device running a
 * second behind would treat a pack bought a moment ago as not started yet, and keep it locked until
 * the next reload.
 */
export const CLOCK_SKEW_MS = 5 * 60_000

/**
 * Folds the parent's entitlement rows into the packs that are open at `now`. Only `pack` rows count:
 * the database still accepts `membership` rows so a subscription could return later, but none opens
 * anything today. With `live` (production), packs bought with a Stripe test card don't count.
 */
export function activeRights(rows: readonly EntitlementRow[], now: number, live: boolean = LIVE_PAYMENTS): Rights {
  const packs = new Set(
    rows.flatMap((row) =>
      row.scope === 'pack' &&
      row.pack_id &&
      countsInThisMode(row.source_id, live) &&
      Date.parse(row.starts_at) <= now + CLOCK_SKEW_MS &&
      (!row.ends_at || Date.parse(row.ends_at) > now)
        ? [row.pack_id]
        : [],
    ),
  )
  return { packs }
}

/**
 * A `pack` row opens a pack sold on its own, or Standard's locked pages: that row is written by the
 * $1.99 Standard unlock, which is bought separately from the picture packs.
 */
function packRowOpens(packId: PackId) {
  return packId === 'standard' || PACK_BY_ID[packId].soldSeparately
}

/** Free pages are open to everyone; paid pages need a `pack` row for their pack. */
export function canColor(mandala: Pick<Mandala, 'tier' | 'pack'>, rights: Rights) {
  if (mandala.tier === 'free') return true
  return packRowOpens(mandala.pack) && rights.packs.has(mandala.pack)
}

async function fetchRights([, parentId]: readonly [string, string]): Promise<Rights> {
  const { data, error } = await createClient()
    .from('entitlements')
    .select('scope, pack_id, source_id, starts_at, ends_at')
    .eq('parent_id', parentId)
    .eq('scope', 'pack')
    .is('revoked_at', null)
  if (error) {
    console.error('Loading purchases failed', error.code)
    throw new Error('We couldn’t check your purchases right now.')
  }
  return activeRights(data as EntitlementRow[], Date.now())
}

/** Re-reads the parent's packs everywhere they're shown, after a purchase is recorded. */
export function refreshEntitlements() {
  return mutate((key) => Array.isArray(key) && key[0] === 'entitlements')
}

/**
 * Pack rights come only from entitlement rows written by the billing server. Nothing on this device
 * can grant them: guests and signed-out devices always get the free flowers.
 */
export function useEntitlements() {
  const auth = useAuthState()
  const parentId = auth.user?.id ?? null
  const { data, error } = useSWR(parentId ? (['entitlements', parentId] as const) : null, fetchRights, {
    revalidateOnFocus: true,
  })
  const packs = parentId ? (data?.packs ?? NO_PACKS) : NO_PACKS
  const ready = auth.status === 'signed-out' || (auth.status === 'signed-in' && (data !== undefined || !!error))

  const isUnlocked = useCallback((mandala: Pick<Mandala, 'tier' | 'pack'>) => canColor(mandala, { packs }), [packs])

  return { packs, ready, failed: !!error && data === undefined, isUnlocked }
}
