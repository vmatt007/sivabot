// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
})

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  plan,
}: {
  customerId?: string
  priceId: string
  userId: string
  plan: string
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    allow_promotion_codes: true,
  })
  return session
}

export async function createOrRetrieveCustomer(email: string, userId: string) {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0].id
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })
  return customer.id
}
