export type ParentUser = {
  id: string
  email: string
}

/**
 * The contract the app codes against. The mock implements it today;
 * a Supabase (@supabase/ssr) implementation will replace it later.
 */
export interface AuthClient {
  readonly provider: 'supabase'
  readonly connected: boolean
  getUser: () => ParentUser | null
  subscribe: (listener: () => void) => () => void
  signInWithPassword: (email: string, password: string) => Promise<ParentUser>
  sendMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}
