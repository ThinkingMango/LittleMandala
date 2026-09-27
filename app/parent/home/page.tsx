import type { Metadata } from 'next'
import { AccountCard } from '@/components/parent/account-card'
import { DeviceSettingsCard } from '@/components/parent/device-settings-card'
import { IntegrationStatusCard } from '@/components/parent/integration-status-card'
import { PlanSummaryCard } from '@/components/parent/plan-summary-card'

export const metadata: Metadata = { title: 'Parent overview' }

export default function ParentHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 md:px-8 md:py-10">
      <h1 className="text-3xl font-black">Overview</h1>
      <div className="grid items-start gap-5 md:grid-cols-2">
        <PlanSummaryCard />
        <AccountCard />
        <DeviceSettingsCard />
        <IntegrationStatusCard />
      </div>
    </main>
  )
}
