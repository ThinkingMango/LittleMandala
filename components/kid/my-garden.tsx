'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CrossCheckDialog, RemovePreview } from '@/components/coloring/kid-dialogs'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { useArtworkLibrary } from '@/hooks/use-artwork-library'
import type { Artwork } from '@/lib/artwork/library'
import { useHydrated } from '@/lib/local-store'
import { getMandala } from '@/lib/mandalas'
import { isGrownUpPage } from '@/lib/packs'

export function MyGarden() {
  const hydrated = useHydrated()
  const { library, state } = useArtworkLibrary()
  const [target, setTarget] = useState<Artwork | null>(null)
  const [open, setOpen] = useState(false)

  const artworks = state.gallery.filter((artwork) => {
    const mandala = getMandala(artwork.templateId)
    return !mandala || !isGrownUpPage(mandala)
  })

  if (!hydrated || artworks.length === 0) return null

  const targetVersion = target && library.templates.version(target.templateId, target.templateVersion)

  return (
    <section aria-labelledby="my-garden-title" className="flex flex-col gap-5">
      <h2 id="my-garden-title" className="text-3xl font-black text-balance md:text-4xl">
        My garden
      </h2>
      <ul className="grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-6">
        {artworks.map((artwork) => {
          const version = library.templates.version(artwork.templateId, artwork.templateVersion)
          if (!version) return null
          const name = getMandala(artwork.templateId)?.name ?? 'Flower'
          return (
            <li key={artwork.id} className="relative">
              <div className="flex aspect-square items-center justify-center rounded-3xl border-4 border-border bg-card p-3">
                <MandalaArt version={version} fills={artwork.fills} className="size-full" />
              </div>
              <button
                type="button"
                aria-label={`Take ${name} out of my garden`}
                title="Take out"
                onClick={() => {
                  setTarget(artwork)
                  setOpen(true)
                }}
                className="tactile absolute -top-3 -right-3 flex size-12 items-center justify-center rounded-full border-2 border-border bg-secondary text-foreground outline-none [--tactile-edge:var(--border)] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="size-6" strokeWidth={3} aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>

      {target && targetVersion && (
        <CrossCheckDialog
          open={open}
          onOpenChange={setOpen}
          title="Take it out?"
          description="This flower will leave your garden."
          preview={<RemovePreview version={targetVersion} fills={target.fills} />}
          cancelLabel="No, keep it"
          confirmLabel="Yes, take it out"
          onConfirm={() => library.removeFromGallery(target.id)}
        />
      )}
    </section>
  )
}
