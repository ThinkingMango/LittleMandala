'use client'

import { useState } from 'react'
import { Check, Eraser, House, Undo2 } from 'lucide-react'
import { ColorPalette } from '@/components/coloring/color-palette'
import { ClearPreview, CrossCheckDialog, DoneDialog } from '@/components/coloring/kid-dialogs'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { ToolButton, ToolLink } from '@/components/coloring/tool-button'
import { AskGrownUp } from '@/components/kid/ask-grown-up'
import { useColoring } from '@/hooks/use-coloring'
import { EMPTY_FILLS, type Fills } from '@/lib/artwork/library'
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
  const coloring = useColoring(mandala)
  const [color, setColor] = useState<ColorKey>(DEFAULT_COLOR)
  const [clearOpen, setClearOpen] = useState(false)
  const [done, setDone] = useState<{ open: boolean; fills: Fills }>({ open: false, fills: EMPTY_FILLS })
  const [undoHint, setUndoHint] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  if (!hydrated) {
    return <main className="min-h-dvh bg-background" aria-busy="true" />
  }

  if (!isUnlocked(mandala)) {
    return <AskGrownUp mandala={mandala} />
  }

  const handleRegionTap = (region: Region, element: SVGPathElement) => {
    if (!coloring.fill(region.id, color)) return
    setUndoHint(false)
    setAnnouncement(`${region.label} is now ${colorLabel(color)}`)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (settings.motion && !reduceMotion) {
      element.animate(POP_FRAMES, { duration: 260, easing: 'ease-out' })
    }
    if (settings.haptics) {
      navigator.vibrate?.(12)
    }
  }

  const handleClear = () => {
    if (!coloring.clear()) return
    setUndoHint(true)
    setAnnouncement('Flower cleared. Tap undo to bring the colors back.')
  }

  const handleUndo = () => {
    const undone = coloring.undo()
    setUndoHint(false)
    if (undone === 'clear') setAnnouncement('Your colors are back.')
    else if (undone === 'fill') setAnnouncement('Undone.')
  }

  const handleDone = () => {
    coloring.saveToGallery()
    setDone({ open: true, fills: coloring.fills })
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
            onClick={handleUndo}
            disabled={!coloring.canUndo}
            className={undoHint ? 'attention' : undefined}
          />
          <ToolButton
            label="Clear"
            icon={<Eraser strokeWidth={2.5} />}
            onClick={() => setClearOpen(true)}
            disabled={!coloring.hasColor}
          />
        </div>
        <ToolButton
          label="I'm done"
          icon={<Check strokeWidth={3.25} />}
          variant="primary"
          onClick={handleDone}
          disabled={!coloring.hasColor}
        />
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center landscape:order-2">
        <MandalaArt
          version={coloring.version}
          fills={coloring.fills}
          label={`${mandala.name} flower. Tap a part to color it.`}
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

      <CrossCheckDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear this flower?"
        description="All the colors on this flower will go away. You can bring them back with undo."
        preview={<ClearPreview version={coloring.version} fills={coloring.fills} />}
        cancelLabel="No, keep my colors"
        confirmLabel="Yes, clear it"
        onConfirm={handleClear}
      />
      <DoneDialog
        open={done.open}
        onOpenChange={(open) => setDone((d) => ({ ...d, open }))}
        version={coloring.version}
        fills={done.fills}
        onFinish={coloring.finish}
      />
    </main>
  )
}
