'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parentGateStore } from '@/lib/device-stores'

const HOLD_MS = 3000
const RING_RADIUS = 76
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

type Problem = { a: number; b: number }

function newProblem(): Problem {
  return { a: 11 + Math.floor(Math.random() * 9), b: 6 + Math.floor(Math.random() * 4) }
}

export function ParentGate() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const frame = useRef<number | null>(null)
  const startedAt = useRef(0)

  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)

  const pass = () => {
    parentGateStore.write(true)
    router.push('/parent/home')
  }

  const cancelFrame = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }

  useEffect(() => cancelFrame, [])

  const tick = (now: number) => {
    const next = Math.min(1, (now - startedAt.current) / HOLD_MS)
    setProgress(next)
    if (next >= 1) {
      cancelFrame()
      pass()
      return
    }
    frame.current = requestAnimationFrame(tick)
  }

  const startHold = () => {
    if (frame.current !== null) return
    startedAt.current = performance.now()
    frame.current = requestAnimationFrame(tick)
  }

  const stopHold = () => {
    cancelFrame()
    setProgress((p) => (p >= 1 ? p : 0))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault()
      startHold()
    }
  }

  const onKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') stopHold()
  }

  const submitAnswer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!problem) return
    if (Number(answer.trim()) === problem.a + problem.b) {
      pass()
      return
    }
    setError('Not quite. Here is a new one.')
    setAnswer('')
    setProblem(newProblem())
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-balance">Grown-ups only</h1>
        <p className="leading-relaxed text-muted-foreground text-pretty">
          Settings and plans live here. Press and hold the button for three seconds to continue.
        </p>
      </div>

      <button
        type="button"
        aria-label="Press and hold for three seconds to open the grown-ups area"
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        className="relative flex size-44 touch-none items-center justify-center rounded-full bg-secondary outline-none select-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4"
      >
        <svg viewBox="0 0 176 176" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
          <circle cx="88" cy="88" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="88"
            cy="88"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
          />
        </svg>
        <span className="flex flex-col items-center gap-1 font-bold">
          <Hand className="size-10" strokeWidth={2.25} aria-hidden="true" />
          <span className="text-sm">{progress > 0 ? 'Keep holding' : 'Hold'}</span>
        </span>
      </button>

      <div className="flex w-full flex-col items-center gap-4 border-t pt-6">
        {problem ? (
          <form onSubmit={submitAnswer} className="flex w-full flex-col gap-3 text-left">
            <Label htmlFor="gate-answer" className="text-base font-bold">
              {`What is ${problem.a} + ${problem.b}?`}
            </Label>
            <div className="flex gap-3">
              <Input
                id="gate-answer"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value)
                  setError(null)
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'gate-error' : undefined}
                className="h-12 rounded-xl text-lg"
                autoFocus
              />
              <Button type="submit" className="h-12 rounded-xl px-6 text-base font-bold">
                Continue
              </Button>
            </div>
            {error && (
              <p id="gate-error" role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
          </form>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setProblem(newProblem())}
            className="h-11 rounded-full px-5 text-sm font-bold text-muted-foreground"
          >
            Answer a question instead
          </Button>
        )}
      </div>
    </div>
  )
}
