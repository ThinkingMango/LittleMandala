import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ColoringScreen } from '@/components/coloring/coloring-screen'
import { MANDALAS, getMandala } from '@/lib/mandalas'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return MANDALAS.map((m) => ({ id: m.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const mandala = getMandala(id)
  return { title: mandala ? `Color ${mandala.name}` : 'Picture not found' }
}

export default async function ColorPage({ params }: Params) {
  const { id } = await params
  const mandala = getMandala(id)
  if (!mandala) notFound()
  return <ColoringScreen mandala={mandala} />
}
