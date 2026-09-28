import useSWR from 'swr'
import { latestSignInAt } from '@/lib/cloud-consent/notice'
import { createClient } from '@/lib/supabase/client'

async function fetchSignedInAt(): Promise<Date | null> {
  const { data } = await createClient().auth.getClaims()
  return latestSignInAt(data?.claims?.amr)
}

/** When this session last signed in with an email link. The server makes the final check. */
export function useRecentSignIn(userId: string | null) {
  return useSWR(userId ? (['recent-sign-in', userId] as const) : null, fetchSignedInAt, {
    revalidateOnFocus: true,
  })
}
