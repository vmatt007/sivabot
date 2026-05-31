import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/types'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured yet' }, { status: 503 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await req.json()
    const plan = PLANS.find(p => p.id === planId)
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const priceId = process.env[plan.stripePriceEnvKey]
    if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

    // Dynamic import — prevents build crash when Stripe keys are missing
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia' as any,
    })

    // Get or create Stripe customer
    const existing = await stripe.customers.list({ email: user.email!, limit: 1 })
    const customerId = existing.data.length > 0
      ? existing.data[0].id
      : (await stripe.customers.create({ email: user.email!, metadata: { supabase_user_id: user.id } })).id

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
      metadata: { userId: user.id, plan: plan.id },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Stripe Checkout]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
