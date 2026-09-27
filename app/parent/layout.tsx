import type { Metadata } from 'next'
import { GateGuard } from '@/components/parent/gate-guard'
import { ParentHeader } from '@/components/parent/parent-header'

export const metadata: Metadata = {
  title: 'Grown-ups',
  robots: { index: false },
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <ParentHeader />
      <GateGuard>{children}</GateGuard>
    </div>
  )
}
