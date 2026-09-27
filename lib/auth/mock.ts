import { createLocalStore } from '@/lib/local-store'
import type { AuthClient, ParentUser } from '@/lib/auth/types'

const userStore = createLocalStore<ParentUser | null>('lm:mock:user', null)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function assertEmail(email: string) {
  if (!EMAIL_PATTERN.test(email.trim())) {
    throw new Error('Please enter a valid email address.')
  }
}

/** Mock-only: stands in for the user clicking the emailed link (Supabase callback). */
export function simulateMagicLinkSignIn(email: string): ParentUser {
  assertEmail(email)
  const normalized = email.trim().toLowerCase()
  const user: ParentUser = { id: `mock_${normalized}`, email: normalized }
  userStore.write(user)
  return user
}

export const mockAuthClient: AuthClient = {
  provider: 'supabase',
  connected: false,
  getUser: userStore.read,
  subscribe: userStore.subscribe,
  async signInWithPassword(email, password) {
    assertEmail(email)
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }
    await wait(500)
    const user: ParentUser = {
      id: `mock_${email.trim().toLowerCase()}`,
      email: email.trim().toLowerCase(),
    }
    userStore.write(user)
    return user
  },
  async sendMagicLink(email) {
    assertEmail(email)
    await wait(500)
  },
  async signOut() {
    userStore.write(null)
  },
}
