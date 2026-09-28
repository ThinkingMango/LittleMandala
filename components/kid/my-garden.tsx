'use client'

import Link from 'next/link'
import { useState } from 'react'
import { House, X } from 'lucide-react'
import { CrossCheckDialog, RemovePreview } from '@/components/coloring/kid-dialogs'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { pictureCount, useGarden } from '@/hooks/use-garden'
import type { Artwork } from '@/lib/artwork/library'
import { useHydrated } from '@/lib/local-store'
import { getMandala } from '@/lib/mandalas'
import { colorHref } from '@/lib/packs'

function EmptyGarden() {
  return (
    <div className="flex flex-col items-start gap-5 rounded-[2rem] border-4 border-dashed border-border p-6 md:p-8">
      <p className="text-2xl font-black text-balance md:text-3xl">Nothing growing yet</p>
      <p className="text-lg font-bold leading-relaxed text-muted-foreground text-pretty">
        {"Finish a picture and tap \u201CI\u2019m done\u201D. It will grow here."}
      </p>
      <Link
        href="/"
        className="tactile flex items-center gap-3 rounded-full border-4 border-border bg-primary px-6 py-3 text-xl font-black text-primary-foreground outline-none [--tactile-edge:var(--border)] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <House className="size-6" strokeWidth={2.75} aria-hidden="true" />
        Pick a pack
      </Link>
    </div>
  )
}

export function MyGarden() {
  const hydrated = useHydrated()
  const { library, artworks } = useGarden()
  const [target, setTarget] = useState<Artwork | null>(null)
  const [open, setOpen] = useState(false)

  if (!hydrated) return null
  if (artworks.length === 0) return <EmptyGarden />

  const targetVersion = target && library.templates.version(target.templateId, target.templateVersion)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-bold text-muted-foreground">{pictureCount(artworks.length)}</p>
      <ul aria-label="My pictures" className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-7 lg:grid-cols-4">
        {artworks.map((artwork) => {
          const version = library.templates.version(artwork.templateId, artwork.templateVersion)
          if (!version) return null
          const mandala = getMandala(artwork.templateId)
          const name = mandala?.name ?? 'Flower'
          const art = <MandalaArt version={version} fills={artwork.fills} className="size-full" />
          return (
            <li key={artwork.id} className="relative">
              {mandala ? (
                <Link
                  href={colorHref(mandala)}
                  onClick={() => library.reopenFromGallery(artwork.id)}
                  aria-label={`Color ${name} again`}
                  className="tactile flex aspect-square items-center justify-center rounded-3xl border-4 border-border bg-card p-3 outline-none [--tactile-edge:var(--border)] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {art}
                </Link>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-3xl border-4 border-border bg-card p-3">
                  {art}
                </div>
              )}
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
    </div>
  )
}
