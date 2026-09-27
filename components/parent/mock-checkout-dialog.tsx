'use client'

import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { billingClient } from '@/lib/billing/client'
import { PLANS } from '@/lib/billing/plans'

type Stage = 'review' | 'processing' | 'success'

type MockCheckoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerEmail: string
}

export function MockCheckoutDialog({ open, onOpenChange, customerEmail }: MockCheckoutDialogProps) {
  const [stage, setStage] = useState<Stage>('review')
  const plan = PLANS.family

  const handleOpenChange = (next: boolean) => {
    if (stage === 'processing') return
    onOpenChange(next)
  }

  const simulatePayment = async () => {
    setStage('processing')
    await billingClient.completeCheckout('family', customerEmail)
    setStage('success')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 rounded-3xl p-6 sm:max-w-md" showCloseButton={stage !== 'processing'}>
        {stage === 'success' ? (
          <>
            <DialogHeader className="items-center text-center">
              <CircleCheck className="size-12 text-primary" strokeWidth={2.25} aria-hidden="true" />
              <DialogTitle className="text-xl font-black">Family plan is active</DialogTitle>
              <DialogDescription className="leading-relaxed">
                All flowers are now unlocked on this device. This was a simulated purchase.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl px-6">
              <DialogClose render={<Button className="h-11 w-full rounded-full font-bold" />}>
                Done
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <NotConnectedBadge service="Paddle" className="self-start" />
              <DialogTitle className="text-xl font-black">Checkout preview</DialogTitle>
              <DialogDescription className="leading-relaxed">
                {"When Paddle is connected, its secure checkout opens here. For now you can simulate a payment. No card is charged."}
              </DialogDescription>
            </DialogHeader>

            <dl className="flex flex-col gap-3 rounded-2xl bg-secondary p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-bold">{plan.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-bold">{`${plan.priceLabel} / month`}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Billed to</dt>
                <dd className="truncate font-bold">{customerEmail}</dd>
              </div>
            </dl>

            <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl px-6">
              <DialogClose
                disabled={stage === 'processing'}
                render={<Button variant="outline" className="h-11 rounded-full px-5 font-bold" />}
              >
                Cancel
              </DialogClose>
              <Button
                onClick={simulatePayment}
                disabled={stage === 'processing'}
                className="h-11 rounded-full px-5 font-bold"
              >
                {stage === 'processing' ? 'Processing…' : 'Simulate payment'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
