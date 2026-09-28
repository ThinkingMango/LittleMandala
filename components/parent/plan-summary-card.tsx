'use client'

import Link from 'next/link'
import { ParentCard } from '@/components/parent/parent-card'
import { buttonVariants } from '@/components/ui/button'
import { useEntitlements } from '@/lib/entitlements'
import { PACKS, packPages } from '@/lib/packs'
import { cn } from '@/lib/utils'

export function PlanSummaryCard() {
  const { isUnlocked } = useEntitlements()
  const rows = PACKS.map((pack) => {
    const pages = packPages(pack.id)
    return { pack, total: pages.length, open: pages.filter(isUnlocked).length }
  })
  const allOpen = rows.every((r) => r.open === r.total)
  const packsOpen = rows.filter((r) => r.open === r.total).length

  return (
    <ParentCard title="Picture packs" description={`${packsOpen} of ${rows.length} packs fully open`}>
      <ul className="flex flex-col divide-y" aria-label="Packs and what is open">
        {rows.map(({ pack, total, open }) => {
          const status = open === total ? 'Open' : open === 0 ? 'Locked' : `${open} of ${total} free`
          return (
            <li key={pack.id} className="flex min-h-12 items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-bold">{pack.name}</span>
                <span className="text-sm text-muted-foreground">{`${total} pictures`}</span>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
                  open === total ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                {status}
              </span>
            </li>
          )
        })}
      </ul>
      {!allOpen && (
        <Link
          href="/parent/billing"
          className={cn(buttonVariants(), 'h-11 self-start rounded-full px-5 font-bold')}
        >
          Get more packs
        </Link>
      )}
    </ParentCard>
  )
}
