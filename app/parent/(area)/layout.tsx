import { ParentHeader } from '@/components/parent/parent-header'

export default function ParentAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <ParentHeader />
      {children}
    </div>
  )
}
