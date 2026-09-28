'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { pictureCount, useGarden } from '@/hooks/use-garden'
import { useHydrated } from '@/lib/local-store'

const COVER_SLOTS = 3

export function GardenCover() {
  const hydrated = useHydrated()
  const { library, artworks } = useGarden()

  if (!hydrated || artworks.length === 0) return null

  const summary = pictureCount(artworks.length)
  const newest = artworks.slice(0, COVER_SLOTS)
  const emptySlots = COVER_SLOTS - newest.length

  return (
    <section aria-label="My garden" className="grid gap-6 md:grid-cols-2 md:gap-8">
      <Link
        href="/garden"
        aria-label={`My garden, ${summary}`}
        className="tactile flex flex-col gap-5 rounded-[2rem] border-4 border-border bg-card p-5 outline-none [--tactile-edge:var(--border)] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 md:p-6"
      >
        <div className="grid grid-cols-3 gap-3" aria-hidden="true">
          {newest.map((artwork) => {
            const version = library.templates.version(artwork.templateId, artwork.templateVersion)
            return (
              <div key={artwork.id} className="aspect-square rounded-2xl bg-secondary p-2">
                {version && <MandalaArt version={version} fills={artwork.fills} className="size-full" />}
              </div>
            )
          })}
          {Array.from({ length: emptySlots }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-2xl border-4 border-dashed border-border" />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary"
            aria-hidden="true"
          >
            <Heart className="size-8" strokeWidth={2.5} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-2xl font-black text-balance md:text-3xl">My garden</h2>
            <p className="text-lg font-bold text-muted-foreground">{summary}</p>
          </div>
        </div>
      </Link>
    </section>
  )
}
