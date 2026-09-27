import { PlugZap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NotConnectedBadge({
  service,
  className,
}: {
  service: 'Supabase' | 'Paddle'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-bold text-warning-foreground',
        className,
      )}
    >
      <PlugZap className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      {`${service} not connected`}
    </span>
  )
}
