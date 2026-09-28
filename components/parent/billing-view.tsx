'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { PackCard } from '@/components/parent/pack-card'
import { OfferGrid } from '@/components/parent/pricing/offer-grid'
import { OrderSummary } from '@/components/parent/pricing/order-summary'
import { StandardUnlockCard } from '@/components/parent/pricing/standard-unlock-card'
import { PACK_PRICE_CENTS, formatPrice } from '@/lib/billing/pricing'
import { useEntitlements } from '@/lib/entitlements'
import { PackGroup } from '@/components/parent/pricing/pack-group'
import {
  FOR_YOU_ANCHOR,
  SOLD_GROWN_UP_PACKS,
  SOLD_KIDS_PACKS,
  SOLD_PACKS,
  packPages,
  type Pack,
  type PackId,
} from '@/lib/packs'

const FUTURE_FLOW = [
  'Paddle.js opens an overlay checkout for the packs in your order, tagged with the signed-in parent’s id.',
  'Paddle sends a signed webhook to /api/paddle/webhook, which verifies it.',
  'The billing server records each pack in Supabase. Pictures unlock only from that record.',
]

const STANDARD_PAID = packPages('standard').filter((page) => page.tier !== 'free')

export function BillingView() {
  const { hasFamily, packs: owned, isUnlocked, failed } = useEntitlements()
  const [chosen, setChosen] = useState<ReadonlySet<PackId>>(() => new Set())
  const [standardChosen, setStandardChosen] = useState(false)

  const statusOf = (id: PackId) => (owned.has(id) ? 'Yours to keep' : hasFamily ? 'Included with your plan' : null)
  const buyable = SOLD_PACKS.filter((pack) => !statusOf(pack.id))
  const inOrder = buyable.filter((pack) => chosen.has(pack.id))
  const standardUnlocked = STANDARD_PAID.every(isUnlocked)

  const toggle = (id: PackId) =>
    setChosen((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const hasGrownUpPacks = SOLD_GROWN_UP_PACKS.length > 0
  const renderPack = (pack: Pack) => (
    <PackCard
      key={pack.id}
      pack={pack}
      status={statusOf(pack.id)}
      selected={chosen.has(pack.id) && !statusOf(pack.id)}
      onToggle={() => toggle(pack.id)}
      headingLevel={hasGrownUpPacks ? 'h4' : 'h3'}
    />
  )

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black">Pricing</h1>
          <NotConnectedBadge service="Paddle" />
        </div>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Buy picture packs once and keep them for good. There’s no subscription, and bundles bring the price down.
        </p>

        <div className="flex items-start gap-3 rounded-2xl bg-warning p-4 text-warning-foreground">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed font-semibold">
            {'Payments aren’t connected yet, so nothing can be bought and no card is charged. These are the proposed prices.'}
          </p>
        </div>

        {failed && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {'We couldn’t check your purchases right now. Paid pictures stay locked until we can.'}
          </p>
        )}
      </div>

      <section aria-labelledby="offers" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="offers" className="text-2xl font-black">
            Picture packs
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {`Every pack is ${formatPrice(PACK_PRICE_CENTS)}, however many pictures it has. Mix and match any packs you like.`}
          </p>
        </div>
        <OfferGrid />
      </section>

      <section aria-labelledby="choose" className="flex flex-col gap-4">
        <h2 id="choose" className="text-2xl font-black">
          Choose your packs
        </h2>

        {hasFamily && (
          <p className="rounded-2xl bg-secondary p-4 text-sm leading-relaxed font-semibold">
            Your earlier plan already includes every picture, so there’s nothing more to buy.
          </p>
        )}

        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-8">
            <PackGroup
              title={hasGrownUpPacks ? 'For your child' : null}
              description="Big, simple pictures for ages 3 to 7."
            >
              {SOLD_KIDS_PACKS.map(renderPack)}
              <StandardUnlockCard
                unlocked={standardUnlocked}
                selected={standardChosen && !standardUnlocked}
                onToggle={() => setStandardChosen((value) => !value)}
              />
            </PackGroup>

            {hasGrownUpPacks && (
              <PackGroup
                id={FOR_YOU_ANCHOR}
                title="For you"
                description="Detailed mandalas for grown-ups, colored behind the parent gate. Same price, and they count toward bundles."
              >
                {SOLD_GROWN_UP_PACKS.map(renderPack)}
              </PackGroup>
            )}
          </div>

          <OrderSummary packs={inOrder} withStandard={standardChosen && !standardUnlocked} buyable={buyable.length} />
        </div>
      </section>

      <section aria-labelledby="future-flow" className="flex flex-col gap-4 rounded-3xl border border-dashed bg-card p-6">
        <h2 id="future-flow" className="font-extrabold">
          How buying will work
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
