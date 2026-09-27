'use client'

import type { ComponentType, SVGProps } from 'react'
import { Fish, Flower2 } from 'lucide-react'
import { MandalaTile } from '@/components/kid/mandala-tile'
import { useEntitlements } from '@/lib/entitlements'
import { MANDALAS, type Mandala } from '@/lib/mandalas'
import { PACKS, packPages, type PackId } from '@/lib/packs'

type Shelf = { id: string; title: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; mandalas: Mandala[] }

const PACK_ICONS: Record<PackId, Shelf['Icon']> = { 'ocean-friends': Fish }

const SHELVES: Shelf[] = [
  { id: 'flowers', title: 'Flowers', Icon: Flower2, mandalas: MANDALAS.filter((m) => !m.pack) },
  ...PACKS.map((pack) => ({ id: pack.id, title: pack.name, Icon: PACK_ICONS[pack.id], mandalas: packPages(pack.id) })),
]

export function MandalaGrid() {
  const { isUnlocked } = useEntitlements()

  return (
    <div className="flex flex-col gap-10">
      {SHELVES.map(({ id, title, Icon, mandalas }) => (
        <section key={id} aria-labelledby={`shelf-${id}`} className="flex flex-col gap-5">
          <h2 id={`shelf-${id}`} className="flex items-center gap-3 text-2xl font-black md:text-3xl">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary" aria-hidden="true">
              <Icon className="size-7" strokeWidth={2.5} />
            </span>
            {title}
          </h2>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-7 lg:grid-cols-4" aria-label={title}>
            {mandalas.map((mandala) => (
              <li key={mandala.id}>
                <MandalaTile mandala={mandala} locked={!isUnlocked(mandala)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
