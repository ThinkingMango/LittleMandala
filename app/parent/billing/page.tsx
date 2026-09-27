import type { Metadata } from 'next'
import { BillingView } from '@/components/parent/billing-view'

export const metadata: Metadata = { title: 'Plan & billing' }

export default function BillingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-5 py-8 md:px-8 md:py-10">
      <BillingView />
    </main>
  )
}
