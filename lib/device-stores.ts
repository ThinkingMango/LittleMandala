import { createLocalStore, type LocalStore } from '@/lib/local-store'
import { MANDALAS } from '@/lib/mandalas'
import type { ColorKey } from '@/lib/palette'

export type Fills = Record<string, ColorKey>

const EMPTY_FILLS: Fills = {}
const artStores = new Map<string, LocalStore<Fills>>()

export function getArtStore(mandalaId: string) {
  let store = artStores.get(mandalaId)
  if (!store) {
    store = createLocalStore<Fills>(`lm:art:${mandalaId}`, EMPTY_FILLS)
    artStores.set(mandalaId, store)
  }
  return store
}

export function clearAllArtwork() {
  MANDALAS.forEach((m) => getArtStore(m.id).clear())
}

export type DeviceSettings = { motion: boolean; haptics: boolean }

export const settingsStore = createLocalStore<DeviceSettings>('lm:settings', {
  motion: true,
  haptics: true,
})

export const parentGateStore = createLocalStore<boolean>('lm:gate', false, 'session')
