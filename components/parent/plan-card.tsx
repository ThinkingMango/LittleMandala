import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { Plan } from '@/lib/billing/types'
import { cn } from '@/lib/utils'

type PlanCardProps = {
  plan: Plan
  current: boolean
  highlighted?: boolean
  action?: ReactNode
}

export function PlanCard({ plan, current, highlighted = false, action }: PlanCardProps) {
  return (
    <section
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        'flex flex-col gap-6 rounded-3xl border bg-card p-6 md:p-8',
        highlighted && 'border-2 border-primary',
      )}
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id={`plan-${plan.id}`} className="text-xl font-black">
            {plan.name}
          </h2>
          {current && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
              Current plan
            </span>
          )}
        </div>
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-black">{plan.priceLabel}</span>
          <span className="text-sm text-muted-foreground">{plan.cadence}</span>
        </p>
        <p className="leading-relaxed text-muted-foreground">{plan.summary}</p>
      </header>

      <ul className="flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {action && <div className="mt-auto flex">{action}</div>}
    </section>
  )
}
