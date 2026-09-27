'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { useAuthState } from '@/lib/auth/client'
import { buttonVariants } from '@/components/ui/button'
import { parentGateStore } from '@/lib/device-stores'
import { useLocalStore } from '@/lib/local-store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/parent/home', label: 'Overview' },
  { href: '/parent/billing', label: 'Plan & billing' },
]

export function ParentHeader() {
  const pathname = usePathname()
  const passed = useLocalStore(parentGateStore)
  const auth = useAuthState()
  const showNav = passed && pathname !== '/parent'
  const nav = auth.status === 'signed-out' ? [...NAV, { href: '/parent/sign-in', label: 'Sign in' }] : NAV

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <BrandMark compact />
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Parents
          </span>
        </div>

        {showNav && (
          <nav aria-label="Parent area" className="order-3 flex w-full gap-1 md:order-none md:w-auto">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2.5 text-sm font-bold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        )}

        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'outline' }), 'h-11 rounded-full px-4 text-sm font-bold')}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to coloring
        </Link>
      </div>
    </header>
  )
}
