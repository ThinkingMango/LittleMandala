'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { DraftBadge } from '@/components/kid/draft-badge'
import { PackIcon } from '@/components/kid/pack-icon'
import { EMPTY_FILLS } from '@/lib/artwork/library'
import { useEntitlements } from '@/lib/entitlements'
import { latestVersion, type Mandala } from '@/lib/mandalas'
import { KIDS_PACKS, packHref, packPages, type Pack } from '@/lib/packs'
import { cn } from '@/lib/utils'

/** A few pages from across the pack, so the cover shows its range rather than only the first pictures. */
function coverPages(pages: Mandala[]) {
  if (pages.length <= 3) return pages
  return [pages[0], pages[Math.floor(pages.length / 2)], pages[pages.length - 1]]
}

function describe(pages: Mandala[], isUnlocked: (m: Mandala) => boolean) {
  const open = pages.filter(isUnlocked)
  const locked = pages.length - open.length
  const pictures = `${pages.length} ${pages.length === 1 ? 'picture' : 'pictures'}`
  if (locked === 0) return pictures
  if (open.length === 0) return `${pictures}, all locked`
  const openWord = open.every((m) => m.tier === 'free') ? 'free' : 'open'
  return `${open.length} ${openWord}, ${locked} locked`
}

function PackCover({ pack }: { pack: Pack }) {
  const { isUnlocked } = useEntitlements()
  const pages = packPages(pack.id)
  const summary = describe(pages, isUnlocked)
  const hasLocked = pages.some((m) => !isUnlocked(m))

  return (
    <Link
      href={packHref(pack.id)}
      aria-label={`${pack.name}${pack.status === 'draft' ? ', draft' : ''}, ${summary}`}
      className="tactile flex flex-col gap-5 rounded-[2rem] border-4 border-border bg-card p-5 outline-none [--tactile-edge:var(--border)] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 md:p-6"
    >
      <div className="grid grid-cols-3 gap-3" aria-hidden="true">
        {coverPages(pages).map((page) => (
          <div key={page.id} className="aspect-square rounded-2xl bg-secondary p-2">
            <MandalaArt
              version={latestVersion(page)}
              fills={EMPTY_FILLS}
              className={cn('size-full', !isUnlocked(page) && 'opacity-35')}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <PackIcon id={pack.id} />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-balance md:text-3xl">{pack.name}</h2>
            <DraftBadge pack={pack} />
          </div>
          <p className="flex items-center gap-2 text-lg font-bold text-muted-foreground">
            {hasLocked && <Lock className="size-5 shrink-0" strokeWidth={2.75} aria-hidden="true" />}
            {summary}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function PackShelf() {
  return (
    <ul className="grid gap-6 md:grid-cols-2 md:gap-8" aria-label="Picture packs">
      {KIDS_PACKS.map((pack) => (
        <li key={pack.id}>
          <PackCover pack={pack} />
        </li>
      ))}
    </ul>
  )
}
