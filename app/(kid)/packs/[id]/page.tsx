import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { House } from 'lucide-react'
import { ToolLink } from '@/components/coloring/tool-button'
import { DraftBadge } from '@/components/kid/draft-badge'
import { PackIcon } from '@/components/kid/pack-icon'
import { PackPictures } from '@/components/kid/pack-pictures'
import { ParentEntryButton } from '@/components/kid/parent-entry-button'
import { PACKS, findPack } from '@/lib/packs'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return PACKS.map((pack) => ({ id: pack.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const pack = findPack(id)
  return { title: pack ? pack.name : 'Pack not found' }
}

export default async function PackPage({ params }: Params) {
  const { id } = await params
  const pack = findPack(id)
  if (!pack) notFound()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-5 pt-6 pb-12 md:px-10 md:pt-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ToolLink href="/" label="All packs" icon={<House strokeWidth={2.5} />} />
          <PackIcon id={pack.id} className="hidden sm:flex" />
          <h1 className="text-3xl font-black text-balance md:text-5xl">{pack.name}</h1>
          <DraftBadge pack={pack} />
        </div>
        <ParentEntryButton />
      </header>
      <PackPictures packId={pack.id} />
    </main>
  )
}
