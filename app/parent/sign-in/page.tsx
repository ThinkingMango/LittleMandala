import type { Metadata } from 'next'
import { SignInForm } from '@/components/parent/sign-in-form'

export const metadata: Metadata = { title: 'Parent sign in' }

type Props = { searchParams: Promise<{ next?: string | string[] }> }

function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value
  return next && next.startsWith('/parent/') && !next.startsWith('//') ? next : '/parent/home'
}

export default async function SignInPage({ searchParams }: Props) {
  const { next } = await searchParams

  return (
    <main className="flex flex-1 items-start justify-center px-5 py-12 md:py-16">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black">Parent sign in</h1>
          <p className="leading-relaxed text-muted-foreground">
            Only grown-ups have accounts. Children never sign in.
          </p>
        </div>
        <SignInForm next={safeNext(next)} />
      </div>
    </main>
  )
}
