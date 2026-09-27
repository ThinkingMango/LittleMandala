'use client'

import { useDraftView } from '@/hooks/use-artwork-library'
import type { Mandala } from '@/lib/mandalas'
import type { ColorKey } from '@/lib/palette'

/**
 * Coloring actions for one flower. Undo/redo history lives in the artwork library next to the
 * draft, so it is still there after the child goes home or the tablet reloads.
 */
export function useColoring(mandala: Mandala) {
  const { library, draft, version, fills, history } = useDraftView(mandala)
  const templateId = mandala.id

  return {
    draft,
    version,
    fills,
    fill: (regionId: string, color: ColorKey) => library.fillRegion(templateId, regionId, color) !== null,
    erase: (regionId: string) => library.eraseRegion(templateId, regionId) !== null,
    clear: () => library.clearDraft(templateId) !== null,
    undo: () => library.undo(templateId),
    redo: () => library.redo(templateId),
    saveToGallery: () => (draft ? library.saveToGallery(draft.id) : false),
    finish: () => library.finishDraft(templateId),
    canUndo: history.undo.length > 0,
    canRedo: history.redo.length > 0,
    hasColor: Object.keys(fills).length > 0,
  }
}
