import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { AFTER_SIGN_IN_COOKIE, safeNext } from '@/lib/auth/redirect'
import { createClient } from '@/lib/supabase/server'

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = ['magiclink', 'signup', 'email']

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNext(request.cookies.get(AFTER_SIGN_IN_COOKIE)?.value)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  let failure: 'expired' | 'link' | null = searchParams.get('error_code') === 'otp_expired' ? 'expired' : 'link'

  if (code || (tokenHash && type && EMAIL_OTP_TYPES.includes(type))) {
    const supabase = await createClient()
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! })
    failure = error ? (error.code === 'otp_expired' ? 'expired' : 'link') : null
  }

  const target = failure
    ? `/parent/sign-in?error=${failure}&next=${encodeURIComponent(next)}`
    : next
  const response = NextResponse.redirect(new URL(target, origin))
  response.cookies.delete(AFTER_SIGN_IN_COOKIE)
  return response
}
