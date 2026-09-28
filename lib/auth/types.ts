export type ParentUser = {
  id: string
  email: string
}

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signed-out'; user: null }
  | { status: 'signed-in'; user: ParentUser }

export interface AuthClient {
  getState: () => AuthState
  subscribe: (listener: () => void) => () => void
  sendEmailLink: (email: string, next: string) => Promise<void>
  signOut: () => Promise<void>
}
