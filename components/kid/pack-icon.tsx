import { Fish, Flower2, type LucideIcon } from 'lucide-react'
import type { PackId } from '@/lib/packs'
import { cn } from '@/lib/utils'

const ICONS: Record<PackId, LucideIcon> = { standard: Flower2, 'ocean-friends': Fish }

export function PackIcon({ id, className }: { id: PackId; className?: string }) {
  const Icon = ICONS[id]
  return (
    <span
      className={cn('flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary', className)}
      aria-hidden="true"
    >
      <Icon className="size-8" strokeWidth={2.5} />
    </span>
  )
}
