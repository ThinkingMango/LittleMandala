'use client'

import { Analytics } from '@vercel/analytics/next'
import { grownUpEventsOnly } from '@/lib/audience-routes'

/** Page-visit counts for the parent area and policy pages. Never mounted on children's screens. */
export function GrownUpAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null
  return <Analytics beforeSend={grownUpEventsOnly} />
}
