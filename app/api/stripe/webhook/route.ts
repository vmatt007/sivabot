import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  try {
    // Dynamically import Stripe only when needed — prevents build crash
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia' as any,
    })

    const event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan
        if (userId && plan) {
          await supabaseAdmin.from('profiles').upsert({
            id: userId, plan,
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString(),
          })
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        const userId = sub.metadata?.userId
        if (userId) {
          await supabaseAdmin.from('profiles').update({ plan: 'free' }).eq('id', userId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[Stripe Webhook]', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
