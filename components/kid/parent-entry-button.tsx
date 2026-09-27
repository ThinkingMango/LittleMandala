import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function ParentEntryButton() {
  return (
    <Link
      href="/parent"
      aria-label="Grown-ups area"
      className="flex h-14 items-center gap-2 rounded-full border-2 border-border px-5 text-base font-bold text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
    >
      <ShieldCheck className="size-5" strokeWidth={2.5} aria-hidden="true" />
      <span>Grown-ups</span>
    </Link>
  )
}
