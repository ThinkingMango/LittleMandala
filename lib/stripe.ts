import 'server-only'
import Stripe from 'stripe'

/**
 * Production takes real payments. Previews and local development share production's database and
 * env vars, so they always stay on the test keys and can never charge a real card.
 */
export const STRIPE_LIVE = process.env.VERCEL_ENV === 'production'

const KEYS = STRIPE_LIVE
  ? {
      secret: ['STRIPE_LIVE_SECRET_KEY', process.env.STRIPE_LIVE_SECRET_KEY],
      publishable: ['STRIPE_LIVE_PUBLISHABLE_KEY', process.env.STRIPE_LIVE_PUBLISHABLE_KEY],
      webhook: ['STRIPE_LIVE_WEBHOOK_SECRET', process.env.STRIPE_LIVE_WEBHOOK_SECRET],
    }
  : {
      secret: ['STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY],
      publishable: ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY],
      webhook: ['STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET],
    }

const KEY_MODE = /^(sk|rk|pk)_(live|test)_/

function key(kind: keyof typeof KEYS) {
  const [name, value] = KEYS[kind]
  if (!value) throw new Error(`${name} is not set`)
  const mode = KEY_MODE.exec(value)?.[2]
  if (kind !== 'webhook' && mode !== (STRIPE_LIVE ? 'live' : 'test')) {
    throw new Error(`${name} is not a ${STRIPE_LIVE ? 'live' : 'test'} key`)
  }
  return value
}

let client: Stripe | null = null

export function stripe() {
  client ??= new Stripe(key('secret'))
  return client
}

export function stripePublishableKey() {
  return key('publishable')
}

export function stripeWebhookSecret() {
  return key('webhook')
}
