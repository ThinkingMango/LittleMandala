'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { ParentCard } from '@/components/parent/parent-card'
import { buttonVariants } from '@/components/ui/button'
import { useEntitlements } from '@/lib/entitlements'
import { EMPTY_FILLS } from '@/lib/artwork/library'
import { MANDALAS, latestVersion } from '@/lib/mandalas'
import { cn } from '@/lib/utils'

export function PlanSummaryCard() {
  const { isUnlocked } = useEntitlements()
  const unlocked = MANDALAS.filter(isUnlocked).length
  const allOpen = unlocked === MANDALAS.length

  return (
    <ParentCard
      title="Pictures"
      description={`${unlocked} of ${MANDALAS.length} pictures unlocked`}
      badge={<NotConnectedBadge service="Paddle" />}
      className="md:col-span-2"
    >
      <ul className="grid grid-cols-6 gap-3 md:grid-cols-9" aria-label="Pictures and their status">
        {MANDALAS.map((m) => {
          const open = isUnlocked(m)
          return (
            <li
              key={m.id}
              className="relative flex aspect-square items-center justify-center rounded-2xl bg-secondary p-2"
            >
              <MandalaArt version={latestVersion(m)} fills={EMPTY_FILLS} className={open ? 'size-full' : 'size-full opacity-30'} />
              {!open && (
                <Lock className="absolute size-4 text-foreground" strokeWidth={2.75} aria-hidden="true" />
              )}
              <span className="sr-only">{`${m.name}: ${open ? 'unlocked' : 'locked'}`}</span>
            </li>
          )
        })}
      </ul>
      <Link
        href="/parent/billing"
        className={cn(
          buttonVariants({ variant: allOpen ? 'outline' : 'default' }),
          'h-11 self-start rounded-full px-5 font-bold',
        )}
      >
        {allOpen ? 'See prices' : 'Unlock more pictures'}
      </Link>
    </ParentCard>
  )
}
