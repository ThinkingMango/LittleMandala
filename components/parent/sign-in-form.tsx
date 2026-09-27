'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Mail, MailCheck } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient, useAuthState } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const RESEND_COOLDOWN_SECONDS = 60

export type LinkError = 'expired' | 'link'

const LINK_ERROR_MESSAGES: Record<LinkError, string> = {
  expired: 'That sign-in link has expired or was already used. Send yourself a new one below.',
  link: 'That sign-in link didn’t work. Open it in the same browser where you asked for it, or send a new one below.',
}

export function SignInForm({ next, linkError }: { next: string; linkError: LinkError | null }) {
  const auth = useAuthState()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState<string | null>(linkError ? LINK_ERROR_MESSAGES[linkError] : null)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const sendLink = async (address: string) => {
    setError(null)
    setPending(true)
    try {
      await authClient.sendEmailLink(address, next)
      setSentTo(address.trim().toLowerCase())
      setSecondsLeft(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void sendLink(email)
  }

  const signOut = async () => {
    setError(null)
    try {
      await authClient.signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing out didn’t finish. Please try again.')
    }
  }

  const errorMessage = error && (
    <p role="alert" className="text-sm font-semibold leading-relaxed text-destructive">
      {error}
    </p>
  )

  if (auth.status === 'loading') {
    return (
      <p aria-live="polite" className="leading-relaxed text-muted-foreground">
        {'Checking whether you’re signed in…'}
      </p>
    )
  }

  if (auth.status === 'signed-in') {
    return (
      <div className="flex flex-col gap-5">
        <p className="leading-relaxed">
          {'Signed in as '}
          <span className="font-bold break-all">{auth.user.email}</span>
          {'.'}
        </p>
        {errorMessage}
        <div className="flex flex-wrap gap-3">
          <Link href={next} className={cn(buttonVariants(), 'h-11 rounded-full px-5 font-bold')}>
            Continue
          </Link>
          <Button variant="outline" onClick={signOut} className="h-11 rounded-full px-5 font-bold">
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4" aria-live="polite">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-1 text-sm leading-relaxed">
            <p className="font-bold">Check your email</p>
            <p>
              {'We sent a sign-in link to '}
              <span className="font-bold break-all">{sentTo}</span>
              {'. Open it on this device, in this browser. Each link works once.'}
            </p>
          </div>
        </div>
        {errorMessage}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => void sendLink(sentTo)}
            disabled={pending || secondsLeft > 0}
            className="h-11 rounded-full px-5 font-bold"
          >
            {pending ? 'Sending…' : secondsLeft > 0 ? `Send again in ${secondsLeft}s` : 'Send again'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSentTo(null)
              setError(null)
            }}
            className="h-11 rounded-full px-5 font-bold"
          >
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {errorMessage}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="font-bold">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl text-base"
          placeholder="you@example.com"
        />
      </div>

      <Button type="submit" disabled={pending} className="h-12 rounded-full text-base font-bold">
        <Mail data-icon="inline-start" />
        {pending ? 'Sending…' : 'Email me a sign-in link'}
      </Button>

      <p className="text-sm leading-relaxed text-muted-foreground">
        No password needed. New here? The same link creates your parent account.
      </p>
    </form>
  )
}
