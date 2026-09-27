import { CreditCard, KeyRound, Tablet } from 'lucide-react'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { ParentCard } from '@/components/parent/parent-card'

const ROWS = [
  {
    icon: KeyRound,
    title: 'Parent sign-in',
    detail: 'Parents sign in with a one-time email link, handled by Supabase Auth.',
    status: (
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Live</span>
    ),
  },
  {
    icon: CreditCard,
    title: 'Payments',
    detail: 'Checkout is simulated. No card is charged until Paddle Billing is connected.',
    status: <NotConnectedBadge service="Paddle" />,
  },
  {
    icon: Tablet,
    title: "Children's artwork",
    detail: 'Always stored on this device only. It is never uploaded.',
    status: (
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
        On device
      </span>
    ),
  },
]

export function IntegrationStatusCard() {
  return (
    <ParentCard
      title="Setup status"
      description="What is real and what is simulated in this preview."
      className="md:col-span-2"
    >
      <ul className="flex flex-col divide-y">
        {ROWS.map(({ icon: Icon, title, detail, status }) => (
          <li key={title} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-bold">{title}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">{detail}</span>
            </div>
            {status}
          </li>
        ))}
      </ul>
    </ParentCard>
  )
}
