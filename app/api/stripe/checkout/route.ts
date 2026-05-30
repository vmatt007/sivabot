import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe'
import { PLANS } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await req.json()
    const plan = PLANS.find(p => p.id === planId)
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const priceId = process.env[plan.stripePriceEnvKey]
    if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

    const customerId = await createOrRetrieveCustomer(user.email!, user.id)
    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId: user.id,
      plan: plan.id,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Stripe Checkout]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
