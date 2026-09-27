'use client'

import { useState } from 'react'
import { useDraftView } from '@/hooks/use-artwork-library'
import type { Fills } from '@/lib/artwork/library'
import type { Mandala } from '@/lib/mandalas'
import type { ColorKey } from '@/lib/palette'

type Step = { kind: 'fill' | 'clear'; artworkId: string; before: Fills }

const MAX_HISTORY = 100

export function useColoring(mandala: Mandala) {
  const { library, draft, version, fills } = useDraftView(mandala)
  const [history, setHistory] = useState<Step[]>([])
  const lastStep = history.at(-1)

  const push = (step: Step) => setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), step])

  const fill = (regionId: string, color: ColorKey) => {
    const result = library.fillRegion(mandala.id, regionId, color)
    if (!result) return false
    push({ kind: 'fill', ...result })
    return true
  }

  /** Clearing is a single history step, so one Undo brings every color back. */
  const clear = () => {
    if (!draft) return false
    const before = library.clearArtwork(draft.id)
    if (!before) return false
    push({ kind: 'clear', artworkId: draft.id, before })
    return true
  }

  const undo = () => {
    if (!lastStep) return null
    if (lastStep.artworkId !== draft?.id) {
      setHistory([])
      return null
    }
    setHistory((h) => h.slice(0, -1))
    return library.setFills(lastStep.artworkId, lastStep.before) ? lastStep.kind : null
  }

  const saveToGallery = () => (draft ? library.saveToGallery(draft.id) : false)
  const finish = () => library.finishDraft(mandala.id)

  return {
    draft,
    version,
    fills,
    fill,
    clear,
    undo,
    saveToGallery,
    finish,
    canUndo: Boolean(draft && lastStep?.artworkId === draft.id),
    hasColor: Object.keys(fills).length > 0,
  }
}
