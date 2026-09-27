import { ParentGate } from '@/components/parent/parent-gate'

export default function ParentGatePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-lg justify-center rounded-3xl border bg-card px-6 py-10 md:px-10">
        <ParentGate />
      </div>
    </main>
  )
}
