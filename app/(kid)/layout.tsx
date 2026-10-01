import { GrownUpScriptGuard } from '@/components/kid/grown-up-script-guard'
import { RelockParentArea } from '@/components/kid/relock-parent-area'

export default function KidLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <GrownUpScriptGuard>
        <RelockParentArea />
        {children}
      </GrownUpScriptGuard>
    </div>
  )
}
