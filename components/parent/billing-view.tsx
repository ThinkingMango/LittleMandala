'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
import { MockCheckoutDialog } from '@/components/parent/mock-checkout-dialog'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { PlanCard } from '@/components/parent/plan-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useParentUser } from '@/lib/auth/client'
import { billingClient, useSubscription } from '@/lib/billing/client'
import { PLANS } from '@/lib/billing/plans'
import { cn } from '@/lib/utils'

const FUTURE_FLOW = [
  'Paddle.js opens an overlay checkout, tagged with the signed-in parent’s id.',
  'Paddle sends a signed webhook to /api/paddle/webhook, which verifies it.',
  'The subscription is saved in Supabase, and flowers unlock from that record.',
]

export function BillingView() {
  const user = useParentUser()
  const subscription = useSubscription()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutAttempt, setCheckoutAttempt] = useState(0)
  const [cancelling, setCancelling] = useState(false)
  const onFamily = subscription.plan === 'family' && subscription.status === 'active'

  const cancelPlan = async () => {
    setCancelling(true)
    await billingClient.cancel()
    setCancelling(false)
  }

  const familyAction = !user ? (
    <Link
      href="/parent/sign-in?next=/parent/billing"
      className={cn(buttonVariants(), 'h-12 w-full rounded-full text-base font-bold')}
    >
      Sign in to subscribe
    </Link>
  ) : onFamily ? (
    <Button
      variant="outline"
      onClick={cancelPlan}
      disabled={cancelling}
      className="h-12 w-full rounded-full text-base font-bold"
    >
      {cancelling ? 'Cancelling…' : 'Cancel plan (simulated)'}
    </Button>
  ) : (
    <Button
      onClick={() => {
        setCheckoutAttempt((n) => n + 1)
        setCheckoutOpen(true)
      }}
      className="h-12 w-full rounded-full text-base font-bold">
      Subscribe
    </Button>
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
          Payments are simulated. Paddle is not connected, so no real checkout opens and no card is charged.
          Prices are placeholders.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PlanCard plan={PLANS.free} current={!onFamily} />
        <PlanCard plan={PLANS.family} current={onFamily} highlighted={!onFamily} action={familyAction} />
      </div>

      {onFamily && subscription.since && (
        <p className="text-sm text-muted-foreground">
          {`Family plan active since ${new Date(subscription.since).toLocaleDateString(undefined, {
            dateStyle: 'long',
          })} (simulated).`}
        </p>
      )}

      <section aria-labelledby="future-flow" className="flex flex-col gap-4 rounded-3xl border border-dashed bg-card p-6">
        <h2 id="future-flow" className="font-extrabold">
          How real billing will work
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

      {user && (
        <MockCheckoutDialog
          key={checkoutAttempt}
          open={checkoutOpen} onOpenChange={setCheckoutOpen} customerEmail={user.email} />
      )}
    </div>
  )
}
