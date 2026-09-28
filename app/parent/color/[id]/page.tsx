import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ColoringScreen } from '@/components/coloring/coloring-screen'
import { MANDALAS, getMandala } from '@/lib/mandalas'
import { isGrownUpPage } from '@/lib/packs'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return MANDALAS.filter(isGrownUpPage).map((m) => ({ id: m.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const mandala = getMandala(id)
  return { title: mandala ? `Color ${mandala.name}` : 'Picture not found' }
}

/** Grown-up pages are colored here, behind the parent gate, never from the kids' area. */
export default async function GrownUpColorPage({ params }: Params) {
  const { id } = await params
  const mandala = getMandala(id)
  if (!mandala || !isGrownUpPage(mandala)) notFound()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ColoringScreen mandala={mandala} />
    </div>
  )
}
