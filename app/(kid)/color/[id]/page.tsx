import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ColoringScreen } from '@/components/coloring/coloring-screen'
import { MANDALAS, getMandala } from '@/lib/mandalas'
import { colorHref, isGrownUpPage } from '@/lib/packs'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return MANDALAS.filter((m) => !isGrownUpPage(m)).map((m) => ({ id: m.id }))
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
  if (isGrownUpPage(mandala)) redirect(colorHref(mandala))
  return <ColoringScreen mandala={mandala} />
}
