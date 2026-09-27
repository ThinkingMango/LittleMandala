import { useSyncExternalStore } from 'react'
import { mockAuthClient } from '@/lib/auth/mock'
import type { AuthClient } from '@/lib/auth/types'

// Swap point: replace with the Supabase implementation once connected.
export const authClient: AuthClient = mockAuthClient

export function useParentUser() {
  return useSyncExternalStore(authClient.subscribe, authClient.getUser, () => null)
}
