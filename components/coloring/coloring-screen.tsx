'use client'

import { useState } from 'react'
import { Check, House, RotateCcw, Undo2 } from 'lucide-react'
import { ColorPalette } from '@/components/coloring/color-palette'
import { ConfirmStartOverDialog, DoneDialog } from '@/components/coloring/kid-dialogs'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { ToolButton, ToolLink } from '@/components/coloring/tool-button'
import { AskGrownUp } from '@/components/kid/ask-grown-up'
import { useColoring } from '@/hooks/use-coloring'
import { settingsStore } from '@/lib/device-stores'
import { useEntitlements } from '@/lib/entitlements'
import { useHydrated, useLocalStore } from '@/lib/local-store'
import type { Mandala, Region } from '@/lib/mandalas'
import { DEFAULT_COLOR, colorLabel, type ColorKey } from '@/lib/palette'

const POP_FRAMES: Keyframe[] = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.06)' },
  { transform: 'scale(1)' },
]

export function ColoringScreen({ mandala }: { mandala: Mandala }) {
  const hydrated = useHydrated()
  const { isUnlocked } = useEntitlements()
  const settings = useLocalStore(settingsStore)
  const { fills, fill, undo, startOver, canUndo, hasColor } = useColoring(mandala.id)
  const [color, setColor] = useState<ColorKey>(DEFAULT_COLOR)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  if (!hydrated) {
    return <main className="min-h-dvh bg-background" aria-busy="true" />
  }

  if (!isUnlocked(mandala)) {
    return <AskGrownUp mandala={mandala} />
  }

  const handleRegionTap = (region: Region, element: SVGPathElement) => {
    if (!fill(region.id, color)) return
    setAnnouncement(`${region.label} is now ${colorLabel(color)}`)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (settings.motion && !reduceMotion) {
      element.animate(POP_FRAMES, { duration: 260, easing: 'ease-out' })
    }
    if (settings.haptics) {
      navigator.vibrate?.(12)
    }
  }

  return (
    <main className="flex h-dvh flex-col gap-4 overflow-hidden p-4 md:gap-6 md:p-6 landscape:flex-row">
      <h1 className="sr-only">{`Coloring ${mandala.name}`}</h1>

      <nav
        aria-label="Tools"
        className="flex items-center justify-between gap-4 landscape:order-3 landscape:flex-col"
      >
        <ToolLink href="/" label="Back to flowers" icon={<House strokeWidth={2.5} />} />
        <div className="flex items-center gap-4 landscape:flex-col">
          <ToolButton
            label="Undo"
            icon={<Undo2 strokeWidth={2.75} />}
            onClick={undo}
            disabled={!canUndo}
          />
          <ToolButton
            label="Start over"
            icon={<RotateCcw strokeWidth={2.75} />}
            onClick={() => setConfirmOpen(true)}
            disabled={!hasColor}
          />
        </div>
        <ToolButton
          label="I'm done"
          icon={<Check strokeWidth={3.25} />}
          variant="primary"
          onClick={() => setDoneOpen(true)}
        />
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center landscape:order-2">
        <MandalaArt
          mandala={mandala}
          fills={fills}
          onRegionTap={handleRegionTap}
          className="size-full max-h-full max-w-full"
        />
      </div>

      <ColorPalette
        value={color}
        onChange={setColor}
        className="self-center landscape:order-1 landscape:flex-col"
      />

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <ConfirmStartOverDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={startOver} />
      <DoneDialog open={doneOpen} onOpenChange={setDoneOpen} mandala={mandala} fills={fills} />
    </main>
  )
}
