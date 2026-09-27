'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { ParentCard } from '@/components/parent/parent-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { authClient, useAuthState } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const DESCRIPTIONS = {
  loading: 'Checking sign-in…',
  'signed-in': 'Signed in on this device with an email link.',
  'signed-out': 'Sign in to manage a plan.',
} as const

export function AccountCard() {
  const auth = useAuthState()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signOut = async () => {
    setError(null)
    setSigningOut(true)
    try {
      await authClient.signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing out didn’t finish. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <ParentCard title="Account" description={DESCRIPTIONS[auth.status]}>
      {auth.status === 'signed-in' ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground"
                aria-hidden="true"
              >
                {auth.user.email.charAt(0).toUpperCase()}
              </span>
              <span className="truncate font-bold">{auth.user.email}</span>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              disabled={signingOut}
              className="h-11 rounded-full px-4 font-bold"
            >
              <LogOut data-icon="inline-start" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
        </div>
      ) : auth.status === 'signed-out' ? (
        <Link
          href="/parent/sign-in"
          className={cn(buttonVariants(), 'h-11 self-start rounded-full px-5 font-bold')}
        >
          Sign in
        </Link>
      ) : null}
    </ParentCard>
  )
}
