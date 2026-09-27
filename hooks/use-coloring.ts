'use client'

import { useCallback, useState } from 'react'
import { getArtStore, type Fills } from '@/lib/device-stores'
import { useLocalStore } from '@/lib/local-store'
import type { ColorKey } from '@/lib/palette'

type Step =
  | { type: 'fill'; regionId: string; prev: ColorKey | null }
  | { type: 'reset'; prev: Fills }

const MAX_HISTORY = 200

export function useColoring(mandalaId: string) {
  const store = getArtStore(mandalaId)
  const fills = useLocalStore(store)
  const [history, setHistory] = useState<Step[]>([])

  const push = useCallback((step: Step) => {
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), step])
  }, [])

  const fill = useCallback(
    (regionId: string, color: ColorKey) => {
      const current = store.read()
      const prev = current[regionId] ?? null
      if (prev === color) return false
      push({ type: 'fill', regionId, prev })
      store.write({ ...current, [regionId]: color })
      return true
    },
    [store, push],
  )

  const undo = useCallback(() => {
    const last = history.at(-1)
    if (!last) return
    setHistory((h) => h.slice(0, -1))
    if (last.type === 'reset') {
      store.write(last.prev)
      return
    }
    const next = { ...store.read() }
    if (last.prev === null) delete next[last.regionId]
    else next[last.regionId] = last.prev
    store.write(next)
  }, [history, store])

  const startOver = useCallback(() => {
    const current = store.read()
    if (Object.keys(current).length === 0) return
    push({ type: 'reset', prev: current })
    store.write({})
  }, [store, push])

  return {
    fills,
    fill,
    undo,
    startOver,
    canUndo: history.length > 0,
    hasColor: Object.keys(fills).length > 0,
  }
}
