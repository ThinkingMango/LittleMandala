'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { CircleAlert, Share } from 'lucide-react'
import { useArtworkLibrary } from '@/hooks/use-artwork-library'

const noSubscribe = () => () => {}
const never = () => false

/** Safari in a normal tab on iPhone or iPad. iPadOS reports itself as a Mac, so touch support tells them apart. */
function isIosBrowserTab() {
  const nav = navigator as Navigator & { standalone?: boolean }
  const ios = /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
  return ios && nav.standalone !== true
}

/**
 * Asked from the parent area only: Firefox shows a permission prompt for this, which a child
 * shouldn't see. Chrome and Android grant it quietly, so the browser won't clear the garden to
 * free up space.
 */
function useRequestPersistentStorage() {
  useEffect(() => {
    const storage = navigator.storage
    if (!storage?.persist || !storage.persisted) return
    storage
      .persisted()
      .then((persisted) => (persisted ? true : storage.persist()))
      .catch(() => {})
  }, [])
}

export function DeviceStorageNotice() {
  const { library } = useArtworkLibrary()
  const saveFailed = useSyncExternalStore(library.subscribe, library.isStorageFull, never)
  const showHomeScreenTip = useSyncExternalStore(noSubscribe, isIosBrowserTab, never)
  useRequestPersistentStorage()

  if (saveFailed) {
    return (
      <div role="alert" className="flex gap-3 rounded-2xl bg-destructive/10 p-4">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-bold text-destructive">{"Coloring isn't being saved"}</p>
          <p className="text-sm leading-relaxed text-foreground">
            {
              "This device has run out of space for Little Mandala, so new taps don't stick. Clear saved coloring below, or free up space on the device."
            }
          </p>
        </div>
      </div>
    )
  }

  if (!showHomeScreenTip) return null

  return (
    <div className="flex gap-3 rounded-2xl bg-secondary p-4">
      <Share className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-bold">Keep the garden safe on this iPad</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {
            "Safari clears saved pictures from sites that go unused for 7 days. Tap Share, then Add to Home Screen, and open Little Mandala from there. Pictures colored in Safari don't move across, so turn on cloud saving to keep them."
          }
        </p>
      </div>
    </div>
  )
}
