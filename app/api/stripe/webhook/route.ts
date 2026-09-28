import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { fulfilCheckoutSession, revokeRefundedPayment } from '@/lib/billing/fulfil'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await fulfilCheckoutSession(event.data.object)
      return
    case 'checkout.session.async_payment_failed':
      console.warn('Delayed checkout payment failed', event.data.object.id)
      return
    case 'charge.refunded': {
      const charge = event.data.object
      const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (charge.refunded && paymentIntent) await revokeRefundedPayment(paymentIntent)
      return
    }
  }
}

/** Stripe calls this after checkout and refunds. Every event is verified, then handled at most once. */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set; ignoring Stripe webhook')
    return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: seen, error: seenError } = await admin
    .from('webhook_events')
    .select('processed_at, attempts')
    .eq('event_id', event.id)
    .maybeSingle()
  if (seenError) {
    console.error('Reading webhook log failed', seenError.message)
    return NextResponse.json({ error: 'unavailable' }, { status: 500 })
  }
  if (seen?.processed_at) return NextResponse.json({ received: true })

  const attempts = (seen?.attempts ?? 0) + 1
  const record = { event_id: event.id, event_type: event.type, occurred_at: new Date(event.created * 1000).toISOString() }
  await admin.from('webhook_events').upsert({ ...record, attempts, last_error: null })

  try {
    await handle(event)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Handling Stripe webhook failed', event.type, message)
    await admin.from('webhook_events').update({ last_error: message.slice(0, 500) }).eq('event_id', event.id)
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 })
  }

  await admin.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('event_id', event.id)
  return NextResponse.json({ received: true })
}
