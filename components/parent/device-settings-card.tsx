'use client'

import { useState, useSyncExternalStore } from 'react'
import { Trash2 } from 'lucide-react'
import { DeviceStorageNotice } from '@/components/parent/device-storage-notice'
import { ParentCard } from '@/components/parent/parent-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useArtworkLibrary } from '@/hooks/use-artwork-library'
import { useCloudSync } from '@/lib/cloud-sync/client'
import { settingsStore, type DeviceSettings } from '@/lib/device-stores'
import { useLocalStore } from '@/lib/local-store'

const TOGGLES: { key: keyof DeviceSettings; label: string; hint: string }[] = [
  { key: 'motion', label: 'Bounce when coloring', hint: 'A small wiggle when a petal is filled.' },
  { key: 'haptics', label: 'Vibrate on tap', hint: 'A tiny buzz each time a petal is filled.' },
]

const noSubscribe = () => () => {}
/** iPad and iPhone browsers have no vibration API, so the switch would do nothing there. */
function useCanVibrate() {
  return useSyncExternalStore(
    noSubscribe,
    () => typeof navigator.vibrate === 'function',
    () => false,
  )
}

export function DeviceSettingsCard() {
  const settings = useLocalStore(settingsStore)
  const { library } = useArtworkLibrary()
  const [cleared, setCleared] = useState(false)
  const canVibrate = useCanVibrate()
  const toggles = TOGGLES.filter((t) => t.key !== 'haptics' || canVibrate)
  const { summary } = useCloudSync()
  const cloudLine =
    summary.state === 'signed-out' || summary.state === 'off'
      ? 'Cloud saving is off, so there are no other copies. They will be gone for good.'
      : summary.saved > 0
        ? `The ${summary.saved === 1 ? 'copy' : `${summary.saved} copies`} in your account will stay there. To delete ${summary.saved === 1 ? 'it' : 'those'}, turn off cloud saving.`
        : 'Any copies already in your account will stay there. To delete those, turn off cloud saving.'

  return (
    <ParentCard
      id="this-device"
      title="On this device"
      description="Artwork is kept on this tablet unless you turn on cloud saving."
    >
      <DeviceStorageNotice />
      <div className="flex flex-col divide-y">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={`setting-${t.key}`} className="font-bold">
                {t.label}
              </Label>
              <span className="text-sm text-muted-foreground">{t.hint}</span>
            </div>
            <Switch
              id={`setting-${t.key}`}
              checked={settings[t.key]}
              onCheckedChange={(checked) => settingsStore.write({ ...settings, [t.key]: checked })}
            />
          </div>
        ))}
      </div>

      <Dialog onOpenChange={(open) => open && setCleared(false)}>
        <DialogTrigger
          render={<Button variant="destructive" className="h-11 self-start rounded-full px-4 font-bold" />}
        >
          <Trash2 data-icon="inline-start" />
          Clear saved coloring
        </DialogTrigger>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {cleared ? 'All clear' : 'Clear all saved coloring?'}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {cleared
                ? 'Every flower is white again and the garden is empty.'
                : `Drafts and every picture in the garden will be removed from this device. This cannot be undone. ${cloudLine}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="rounded-b-3xl">
            <DialogClose render={<Button variant="outline" className="h-10 rounded-full px-4" />}>
              {cleared ? 'Done' : 'Cancel'}
            </DialogClose>
            {!cleared && (
              <Button
                variant="destructive"
                className="h-10 rounded-full px-4 font-bold"
                onClick={() => {
                  library.clearAll()
                  setCleared(true)
                }}
              >
                Clear everything
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ParentCard>
  )
}
