'use client'

import { useEffect, useState } from 'react'
import { Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'

const RESEND_COOLDOWN_SECONDS = 60
const RETURN_PATH = '/parent/cloud-saving'

type Props = { email: string; action: 'turn on' | 'turn off' }

export function FreshSignInPrompt({ email, action }: Props) {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const send = async () => {
    setError(null)
    setPending(true)
    try {
      await authClient.sendEmailLink(email, RETURN_PATH)
      setSent(true)
      setSecondsLeft(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We couldn’t send the email. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-secondary p-5">
      <div className="flex items-start gap-3">
        {sent ? (
          <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        )}
        <div className="flex flex-col gap-1 text-sm leading-relaxed" aria-live="polite">
          {sent ? (
            <>
              <p className="font-bold">Check your email</p>
              <p>
                {'We sent a fresh link to '}
                <span className="font-bold break-all">{email}</span>
                {`. Open it in this browser. It brings you back here, and you then have 10 minutes to ${action} cloud saving.`}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold">Confirm it’s you with a fresh email link</p>
              <p>
                {`To protect your child, only a grown-up who signed in during the last 10 minutes can ${action} cloud saving. This stops anyone using an already signed-in family tablet from changing it.`}
              </p>
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button
        onClick={() => void send()}
        disabled={pending || secondsLeft > 0}
        className="h-11 self-start rounded-full px-5 font-bold"
      >
        <Mail data-icon="inline-start" />
        {pending
          ? 'Sending…'
          : secondsLeft > 0
            ? `Send again in ${secondsLeft}s`
            : sent
              ? 'Send again'
              : 'Email me a fresh link'}
      </Button>
    </div>
  )
}
