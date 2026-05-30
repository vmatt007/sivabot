// types/index.ts

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: 'free' | 'starter' | 'pro' | 'trader'
  stripe_customer_id?: string
  created_at: string
}

export interface Strategy {
  id: string
  name: string
  provider: string        // e.g. "PeakBot" | "SivaBot"
  asset_class: string     // e.g. "SPX Options", "Equities"
  win_rate: number        // e.g. 94.2
  live_since: string      // ISO date
  monthly_return: number  // e.g. 8.4 (%)
  max_drawdown: number    // e.g. -3.2 (%)
  total_trades: number
  description: string
  tags: string[]
  is_active: boolean
  price_monthly: number   // USD
}

export interface PortfolioSnapshot {
  date: string            // ISO date
  value: number           // USD
  pnl: number             // USD
  pnl_pct: number         // %
}

export interface UserStrategy {
  id: string
  user_id: string
  strategy_id: string
  strategy: Strategy
  allocated_budget: number
  tickers: string[]
  is_active: boolean
  subscribed_at: string
  total_pnl: number
  total_pnl_pct: number
}

export interface PlanConfig {
  id: 'starter' | 'pro' | 'trader'
  name: string
  price: number
  stripePriceEnvKey: string
  features: string[]
  maxStrategies: number
}

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    stripePriceEnvKey: 'STRIPE_PRICE_STARTER',
    maxStrategies: 1,
    features: [
      '1 active strategy',
      'SivaBot broker sync',
      'Trade notifications',
      'Performance dashboard',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    stripePriceEnvKey: 'STRIPE_PRICE_PRO',
    maxStrategies: -1, // unlimited
    features: [
      'Unlimited strategies',
      'SivaBot broker sync',
      'Priority <3s execution',
      'Multi-ticker automation',
      'Budget controls per ticker',
      'Email + SMS alerts',
    ],
  },
  {
    id: 'trader',
    name: 'Trader',
    price: 199,
    stripePriceEnvKey: 'STRIPE_PRICE_TRADER',
    maxStrategies: -1,
    features: [
      'Everything in Pro',
      'Publish your own strategy',
      'Earn recurring revenue',
      'Set your own pricing',
      'Live in 1 week',
      'Dedicated onboarding',
    ],
  },
]
