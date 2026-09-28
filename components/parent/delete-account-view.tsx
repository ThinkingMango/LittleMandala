'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CircleCheck, LogIn, Trash2 } from 'lucide-react'
import { FreshSignInPrompt } from '@/components/parent/fresh-sign-in-prompt'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNow } from '@/hooks/use-now'
import { AccountDeletionError, deleteAccount } from '@/lib/account/client'
import { authClient, useAuthState } from '@/lib/auth/client'
import { useRecentSignIn } from '@/lib/auth/recent-sign-in'
import { freshSignInRemainingMs } from '@/lib/cloud-consent/notice'
import { cloudSync } from '@/lib/cloud-sync/client'
import { cn } from '@/lib/utils'

const PANEL = 'flex flex-col gap-5 rounded-3xl border bg-card p-6 md:p-8'
const RETURN_PATH = '/parent/delete-account'

const DELETED = [
  'Your sign-in and email address',
  'Every cloud copy of your child’s pictures',
  'Your cloud saving permission records',
  'Your plan and flower unlock records in Little Mandala',
]

export function DeleteAccountView() {
  const auth = useAuthState()
  const [deleted, setDeleted] = useState(false)

  if (deleted) {
    return (
      <section className={PANEL} role="status">
        <CircleCheck className="size-10 text-primary" strokeWidth={2.25} aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold">Your account was deleted</h2>
          <p className="leading-relaxed text-muted-foreground">
            {'Your sign-in, cloud pictures and records are gone. Pictures on this device are still here, and your child can keep coloring.'}
          </p>
        </div>
        <Link href="/" className={cn(buttonVariants(), 'h-11 self-start rounded-full px-5 font-bold')}>
          Back to coloring
        </Link>
      </section>
    )
  }

  if (auth.status === 'loading') {
    return <p className="leading-relaxed text-muted-foreground">{'Checking whether you’re signed in…'}</p>
  }

  if (auth.status === 'signed-out') {
    return (
      <section className={PANEL}>
        <p className="leading-relaxed text-muted-foreground">Sign in to the account you want to delete.</p>
        <Link
          href={`/parent/sign-in?next=${encodeURIComponent(RETURN_PATH)}`}
          className={cn(buttonVariants(), 'h-11 self-start rounded-full px-5 font-bold')}
        >
          <LogIn data-icon="inline-start" />
          Sign in
        </Link>
      </section>
    )
  }

  return <DeleteAccountForm userId={auth.user.id} email={auth.user.email} onDeleted={() => setDeleted(true)} />
}

type FormProps = { userId: string; email: string; onDeleted: () => void }

function DeleteAccountForm({ userId, email, onDeleted }: FormProps) {
  const { data: signedInAt } = useRecentSignIn(userId)
  const now = useNow()
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverSaysStale, setServerSaysStale] = useState(false)

  const remainingMs = freshSignInRemainingMs(signedInAt ?? null, now)
  const fresh = remainingMs > 0 && !serverSaysStale
  const matches = typed.trim().toLowerCase() === email.toLowerCase()

  const remove = async () => {
    setError(null)
    setPending(true)
    await cloudSync.pause()
    try {
      await deleteAccount(typed)
      cloudSync.setParent(null)
      onDeleted()
      await authClient.signOut().catch(() => {})
    } catch (err) {
      if (err instanceof AccountDeletionError && err.code === 'recent_sign_in_required') setServerSaysStale(true)
      else setError(err instanceof Error ? err.message : 'Your account wasn’t deleted. Please try again.')
    } finally {
      setPending(false)
      void cloudSync.resume()
    }
  }

  return (
    <>
      <section className={PANEL} aria-labelledby="what-is-deleted">
        <h2 id="what-is-deleted" className="text-xl font-extrabold">
          What gets deleted
        </h2>
        <ul className="flex flex-col gap-2">
          {DELETED.map((item) => (
            <li key={item} className="flex items-start gap-3 leading-relaxed">
              <Trash2 className="mt-1 size-4 shrink-0 text-destructive" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="leading-relaxed text-muted-foreground">
          {'If you ever bought a pack, we keep a record of each payment for accounting: the amount, date, packs and payment number. It no longer shows your email or links to you. Stripe, our payment provider, keeps its own receipts.'}
        </p>
        <p className="leading-relaxed text-muted-foreground">
          {'Deletion happens right away and can’t be undone. Pictures on this device stay here. To remove them too, use Clear saved coloring on the Overview page first.'}
        </p>
      </section>

      <section className={PANEL} aria-labelledby="confirm-deletion">
        <h2 id="confirm-deletion" className="text-xl font-extrabold">
          Confirm
        </h2>
        {fresh ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (matches && !pending) void remove()
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-email" className="flex-wrap font-bold">
                {'Type '}
                <span className="break-all">{email}</span>
                {' to confirm'}
              </Label>
              <Input
                id="confirm-email"
                type="email"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <Button
              type="submit"
              variant="destructive"
              disabled={!matches || pending}
              className="h-12 self-start rounded-full px-6 text-base font-bold"
            >
              <Trash2 data-icon="inline-start" />
              {pending ? 'Deleting…' : 'Delete my account'}
            </Button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {`You have about ${Math.max(1, Math.round(remainingMs / 60_000))} min left with this sign-in.`}
            </p>
          </form>
        ) : (
          <FreshSignInPrompt email={email} action="delete your account" returnPath={RETURN_PATH} />
        )}
        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </section>
    </>
  )
}
