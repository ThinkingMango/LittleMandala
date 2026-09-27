'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, MailCheck } from 'lucide-react'
import { NotConnectedBadge } from '@/components/parent/not-connected-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient, useParentUser } from '@/lib/auth/client'
import { simulateMagicLinkSignIn } from '@/lib/auth/mock'
import { cn } from '@/lib/utils'

type Mode = 'password' | 'magic'

export function SignInForm({ next }: { next: string }) {
  const router = useRouter()
  const user = useParentUser()
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      if (mode === 'password') {
        await authClient.signInWithPassword(email, password)
        router.push(next)
      } else {
        await authClient.sendMagicLink(email)
        setLinkSentTo(email.trim().toLowerCase())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setPending(false)
    }
  }

  if (user) {
    return (
      <div className="flex flex-col gap-5">
        <p className="leading-relaxed">
          {'Signed in as '}
          <span className="font-bold">{user.email}</span>
          {' (mock account).'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={next} className={cn(buttonVariants(), 'h-11 rounded-full px-5 font-bold')}>
            Continue
          </Link>
          <Button
            variant="outline"
            onClick={() => authClient.signOut()}
            className="h-11 rounded-full px-5 font-bold"
          >
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  if (linkSentTo) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            {'Once Supabase is connected, a sign-in link will be emailed to '}
            <span className="font-bold">{linkSentTo}</span>
            {'. Nothing was sent in this preview.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              simulateMagicLinkSignIn(linkSentTo)
              router.push(next)
            }}
            className="h-11 rounded-full px-5 font-bold"
          >
            Simulate opening the link
          </Button>
          <Button
            variant="outline"
            onClick={() => setLinkSentTo(null)}
            className="h-11 rounded-full px-5 font-bold"
          >
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Sign-in method" className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
        {(
          [
            { id: 'password', label: 'Password' },
            { id: 'magic', label: 'Email link' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={mode === tab.id}
            onClick={() => {
              setMode(tab.id)
              setError(null)
            }}
            className={cn(
              'h-10 rounded-full text-sm font-bold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
              mode === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="font-bold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl text-base"
            placeholder="you@example.com"
          />
        </div>

        {mode === 'password' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="font-bold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl text-base"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-12 rounded-full text-base font-bold">
          {mode === 'magic' && <Mail data-icon="inline-start" />}
          {pending ? 'Please wait…' : mode === 'password' ? 'Sign in' : 'Email me a link'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 rounded-2xl border border-dashed p-4">
        <NotConnectedBadge service="Supabase" className="self-start" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          This preview signs you in with a mock account saved on this device. No details are sent anywhere.
        </p>
      </div>
    </div>
  )
}
