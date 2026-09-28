import type { Metadata } from 'next'
import { House, Heart } from 'lucide-react'
import { ToolLink } from '@/components/coloring/tool-button'
import { MyGarden } from '@/components/kid/my-garden'
import { ParentEntryButton } from '@/components/kid/parent-entry-button'

export const metadata: Metadata = { title: 'My garden' }

export default function GardenPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-5 pt-6 pb-12 md:px-10 md:pt-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ToolLink href="/" label="All packs" icon={<House strokeWidth={2.5} />} />
          <span
            className="hidden size-14 shrink-0 items-center justify-center rounded-full bg-secondary sm:flex"
            aria-hidden="true"
          >
            <Heart className="size-8" strokeWidth={2.5} />
          </span>
          <h1 className="text-3xl font-black text-balance md:text-5xl">My garden</h1>
        </div>
        <ParentEntryButton />
      </header>
      <MyGarden />
    </main>
  )
}
