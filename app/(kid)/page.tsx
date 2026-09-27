import { BrandMark } from '@/components/brand-mark'
import { MandalaGrid } from '@/components/kid/mandala-grid'
import { ParentEntryButton } from '@/components/kid/parent-entry-button'

export default function PickerPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-5 pt-6 pb-12 md:px-10 md:pt-8">
      <header className="flex items-center justify-between gap-4">
        <BrandMark />
        <ParentEntryButton />
      </header>
      <h1 className="text-4xl font-black text-balance md:text-5xl">Pick a flower</h1>
      <MandalaGrid />
    </main>
  )
}
