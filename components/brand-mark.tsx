import { MandalaArt } from '@/components/coloring/mandala-art'
import type { Fills } from '@/lib/device-stores'
import { getMandala } from '@/lib/mandalas'
import { PALETTE } from '@/lib/palette'
import { cn } from '@/lib/utils'

const logo = getMandala('sunny')!

const logoFills: Fills = Object.fromEntries(
  logo.regions.map((region, i) => [
    region.id,
    region.id === 'center' ? 'yellow' : PALETTE[i % PALETTE.length].key,
  ]),
)

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <MandalaArt mandala={logo} fills={logoFills} className={compact ? 'size-9' : 'size-12'} />
      <span className={cn('font-black tracking-tight', compact ? 'text-xl' : 'text-2xl')}>
        Little Mandala
      </span>
    </span>
  )
}
