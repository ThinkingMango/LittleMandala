'use client'

import Link from 'next/link'
import { LayoutGrid, Paintbrush, RotateCcw, Sparkles, X } from 'lucide-react'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Fills } from '@/lib/device-stores'
import type { Mandala } from '@/lib/mandalas'
import { cn } from '@/lib/utils'

const bigButton =
  'tactile flex h-18 flex-1 items-center justify-center gap-3 rounded-full px-6 text-xl font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 [&_svg]:size-7'

const dialogShell =
  'flex flex-col items-center gap-6 rounded-[2.5rem] p-8 text-center sm:max-w-lg ring-0 shadow-2xl'

type ConfirmStartOverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmStartOverDialog({ open, onOpenChange, onConfirm }: ConfirmStartOverProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={dialogShell}>
        <span className="flex size-24 items-center justify-center rounded-full bg-secondary">
          <RotateCcw className="size-12 text-foreground" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <DialogTitle className="text-3xl font-black text-balance">Start over?</DialogTitle>
        <DialogDescription className="text-lg leading-relaxed text-muted-foreground">
          All the colors on this flower will go away.
        </DialogDescription>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(bigButton, 'bg-secondary text-foreground [--tactile-edge:var(--border)]')}
          >
            <X aria-hidden="true" strokeWidth={3} />
            Keep it
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className={cn(
              bigButton,
              'bg-destructive text-primary-foreground [--tactile-edge:color-mix(in_oklch,var(--destructive)_60%,var(--ink))]',
            )}
          >
            <RotateCcw aria-hidden="true" strokeWidth={3} />
            Start over
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type DoneDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mandala: Mandala
  fills: Fills
}

export function DoneDialog({ open, onOpenChange, mandala, fills }: DoneDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={dialogShell}>
        <div className="relative flex size-56 items-center justify-center">
          <MandalaArt mandala={mandala} fills={fills} className="size-full" />
          <Sparkles
            className="animate-twinkle absolute -top-2 -left-3 size-10 text-swatch-yellow"
            fill="currentColor"
            aria-hidden="true"
          />
          <Sparkles
            className="animate-twinkle absolute -right-4 top-10 size-8 text-swatch-orange [animation-delay:400ms]"
            fill="currentColor"
            aria-hidden="true"
          />
          <Sparkles
            className="animate-twinkle absolute -bottom-2 left-6 size-7 text-swatch-blue [animation-delay:800ms]"
            fill="currentColor"
            aria-hidden="true"
          />
        </div>
        <DialogTitle className="text-4xl font-black text-balance">Beautiful!</DialogTitle>
        <DialogDescription className="sr-only">
          Your flower is saved. Pick another flower or keep coloring.
        </DialogDescription>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(bigButton, 'bg-secondary text-foreground [--tactile-edge:var(--border)]')}
          >
            <Paintbrush aria-hidden="true" strokeWidth={2.5} />
            Keep going
          </button>
          <Link
            href="/"
            className={cn(
              bigButton,
              'bg-primary text-primary-foreground [--tactile-edge:color-mix(in_oklch,var(--primary)_60%,var(--ink))]',
            )}
          >
            <LayoutGrid aria-hidden="true" strokeWidth={2.5} />
            More flowers
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
