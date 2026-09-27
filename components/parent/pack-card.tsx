'use client'

import { Check } from 'lucide-react'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { Button } from '@/components/ui/button'
import { EMPTY_FILLS } from '@/lib/artwork/library'
import { useEntitlements } from '@/lib/entitlements'
import { latestVersion } from '@/lib/mandalas'
import { packPages, type Pack } from '@/lib/packs'

export function PackCard({ pack }: { pack: Pack }) {
  const { hasFamily, packs } = useEntitlements()
  const pages = packPages(pack.id)
  const owned = packs.has(pack.id)
  const status = owned ? 'Yours to keep' : hasFamily ? 'Included with Family' : null

  return (
    <section aria-labelledby={`pack-${pack.id}`} className="flex flex-col gap-6 rounded-3xl border bg-card p-6 md:p-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`pack-${pack.id}`} className="text-xl font-black">
            {pack.name}
          </h2>
          {status && (
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
              <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              {status}
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-muted-foreground">{`${pages.length} pictures · picture pack`}</p>
        <p className="leading-relaxed text-muted-foreground text-pretty">{pack.description}</p>
      </header>

      <ul className="grid grid-cols-4 gap-3" aria-label={`Pictures in ${pack.name}`}>
        {pages.map((page) => (
          <li key={page.id} className="flex flex-col items-center gap-1">
            <div className="aspect-square w-full rounded-2xl bg-secondary p-2">
              <MandalaArt version={latestVersion(page)} fills={EMPTY_FILLS} className="size-full" />
            </div>
            <span className="text-center text-xs font-semibold text-muted-foreground">{page.name}</span>
          </li>
        ))}
      </ul>

      {!status && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Included with the Family plan. A one-time purchase will be offered once payments are connected.
          </p>
          <Button disabled className="h-12 w-full rounded-full text-base font-bold sm:w-auto sm:self-start sm:px-6">
            Buy once
          </Button>
        </div>
      )}
    </section>
  )
}
