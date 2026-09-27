'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { ParentCard } from '@/components/parent/parent-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { authClient, useParentUser } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

export function AccountCard() {
  const user = useParentUser()

  return (
    <ParentCard
      title="Account"
      description={user ? 'Signed in on this device.' : 'Sign in to manage a plan.'}
      badge={<NotConnectedBadge service="Supabase" />}
    >
      {user ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground"
              aria-hidden="true"
            >
              {user.email.charAt(0).toUpperCase()}
            </span>
            <span className="truncate font-bold">{user.email}</span>
          </div>
          <Button
            variant="outline"
            onClick={() => authClient.signOut()}
            className="h-11 rounded-full px-4 font-bold"
          >
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      ) : (
        <Link
          href="/parent/sign-in"
          className={cn(buttonVariants(), 'h-11 self-start rounded-full px-5 font-bold')}
        >
          Sign in
        </Link>
      )}
    </ParentCard>
  )
}
