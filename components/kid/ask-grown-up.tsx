import { House, Lock } from 'lucide-react'
import { ToolLink } from '@/components/coloring/tool-button'
import { MandalaArt } from '@/components/coloring/mandala-art'
import { EMPTY_FILLS } from '@/lib/artwork/library'
import { latestVersion, type Mandala } from '@/lib/mandalas'
import { PACK_BY_ID, packHref } from '@/lib/packs'

export function AskGrownUp({ mandala }: { mandala: Mandala }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="relative size-64">
        <MandalaArt version={latestVersion(mandala)} fills={EMPTY_FILLS} className="size-full opacity-40" />
        <span className="absolute inset-0 m-auto flex size-24 items-center justify-center rounded-full bg-ink text-background">
          <Lock className="size-12" strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>
      <h1 className="text-4xl font-black text-balance">Ask a grown-up</h1>
      <p className="max-w-sm text-lg leading-relaxed text-muted-foreground text-pretty">
        This picture is still sleeping. A grown-up can wake it up.
      </p>
      <ToolLink
        href={packHref(mandala.pack)}
        label={`Back to ${PACK_BY_ID[mandala.pack].name}`}
        icon={<House strokeWidth={2.5} />}
        variant="primary"
      />
    </main>
  )
}
