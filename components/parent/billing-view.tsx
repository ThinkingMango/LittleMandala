'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { PackCard } from '@/components/parent/pack-card'
import { PlanCard } from '@/components/parent/plan-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useParentUser } from '@/lib/auth/client'
import { PLANS } from '@/lib/billing/plans'
import { useEntitlements } from '@/lib/entitlements'
import { SOLD_PACKS } from '@/lib/packs'
import { cn } from '@/lib/utils'

const FUTURE_FLOW = [
  'Paddle.js opens an overlay checkout, tagged with the signed-in parent’s id.',
  'Paddle sends a signed webhook to /api/paddle/webhook, which verifies it.',
  'The billing server records the plan in Supabase. Flowers unlock only from that record.',
]

export function BillingView() {
  const user = useParentUser()
  const { hasFamily, membership, ready, failed } = useEntitlements()

  const familyAction = !user ? (
    <Link
      href="/parent/sign-in?next=/parent/billing"
      className={cn(buttonVariants(), 'h-12 w-full rounded-full text-base font-bold')}
    >
      Sign in to subscribe
    </Link>
  ) : (
    <div className="flex flex-col gap-2">
      <Button disabled className="h-12 w-full rounded-full text-base font-bold">
        {hasFamily ? 'Manage plan' : 'Subscribe'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">Available once Paddle is connected.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Plan & billing</h1>
        <NotConnectedBadge service="Paddle" />
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-warning p-4 text-warning-foreground">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="text-sm leading-relaxed font-semibold">
          {'Payments aren’t connected yet, so no plan can be bought and no card is charged. Prices are placeholders.'}
        </p>
      </div>

      {failed && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {'We couldn’t check your plan right now. Paid flowers stay locked until we can.'}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <PlanCard plan={PLANS.free} current={ready && !hasFamily} />
        <PlanCard plan={PLANS.family} current={hasFamily} highlighted={!hasFamily} action={familyAction} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-black">Picture packs</h2>
        {SOLD_PACKS.map((pack) => (
          <PackCard key={pack.id} pack={pack} />
        ))}
      </div>

      {hasFamily && (
        <p className="text-sm text-muted-foreground">
          {membership?.endsAt
            ? `Family plan active until ${membership.endsAt.toLocaleDateString(undefined, { dateStyle: 'long' })}.`
            : 'Family plan active.'}
        </p>
      )}

      <section aria-labelledby="future-flow" className="flex flex-col gap-4 rounded-3xl border border-dashed bg-card p-6">
        <h2 id="future-flow" className="font-extrabold">
          How billing will work
        </h2>
        <ol className="flex flex-col gap-3">
          {FUTURE_FLOW.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-black text-foreground"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
