// lib/strategies.ts
// Fetches strategy data from configured provider.
// Change NEXT_PUBLIC_DATA_PROVIDER env var to switch sources.

import { DATA_PROVIDER, getApiBase, getApiKey } from '@/config/dataProvider'
import type { Strategy, PortfolioSnapshot, UserStrategy } from '@/types'

// ── Mock data (used as fallback when API is unavailable) ──────────
const MOCK_STRATEGIES: Strategy[] = [
  {
    id: 'king-ai-iron-condors',
    name: 'King AI Iron Condors',
    provider: 'SivaBot',
    asset_class: 'SPX Options',
    win_rate: 85.4,
    live_since: '2025-09-17',
    monthly_return: 6.8,
    max_drawdown: -2.1,
    total_trades: 187,
    description: 'AI-driven iron condor strategy on SPX. Targets premium decay with tight risk management.',
    tags: ['Options', 'SPX', 'Iron Condor', 'AI'],
    is_active: true,
    price_monthly: 79,
  },
  {
    id: '10-percent-per-month',
    name: '10% Per Month',
    provider: 'SivaBot',
    asset_class: 'Credit Spreads · SPX',
    win_rate: 94.1,
    live_since: '2024-01-04',
    monthly_return: 9.4,
    max_drawdown: -1.8,
    total_trades: 412,
    description: 'Consistent credit spread strategy targeting 10% monthly returns on SPX with defined risk.',
    tags: ['Credit Spreads', 'SPX', 'High Win Rate'],
    is_active: true,
    price_monthly: 79,
  },
  {
    id: 'bulltrade-credit-spreads',
    name: 'BullTrade Credit Spreads',
    provider: 'SivaBot',
    asset_class: 'Long Options',
    win_rate: 90.2,
    live_since: '2025-10-28',
    monthly_return: 7.2,
    max_drawdown: -3.4,
    total_trades: 96,
    description: 'Directional credit spread strategy combining technical signals with options premium capture.',
    tags: ['Options', 'Credit Spreads', 'Directional'],
    is_active: true,
    price_monthly: 79,
  },
  {
    id: 'the-wheel',
    name: 'The Wheel Strategy',
    provider: 'SivaBot',
    asset_class: 'Equities',
    win_rate: 78.6,
    live_since: '2022-12-12',
    monthly_return: 4.1,
    max_drawdown: -8.2,
    total_trades: 1043,
    description: 'Classic wheel strategy (CSP → Covered Call) on high-quality equities. Lower risk, steady income.',
    tags: ['Wheel', 'Equities', 'Covered Calls', 'CSP'],
    is_active: true,
    price_monthly: 29,
  },
]

const MOCK_PORTFOLIO: PortfolioSnapshot[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const base = 25000
  const growth = base * (1 + (i * 0.004) + (Math.sin(i * 0.5) * 0.008))
  return {
    date: date.toISOString().split('T')[0],
    value: Math.round(growth),
    pnl: Math.round(growth - base),
    pnl_pct: parseFloat(((growth - base) / base * 100).toFixed(2)),
  }
})

// ── Provider-specific fetchers ────────────────────────────────────

async function fetchFromPeakBot<T>(endpoint: string, fallback: T): Promise<T> {
  const apiKey = getApiKey()
  const base = getApiBase()
  if (!apiKey || !base) return fallback
  try {
    const res = await fetch(`${base}${endpoint}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`PeakBot API error: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[SivaBot] PeakBot fetch failed, using mock data:', err)
    return fallback
  }
}

async function fetchFromSivaBot<T>(endpoint: string, fallback: T): Promise<T> {
  const apiKey = getApiKey()
  const base = getApiBase()
  if (!apiKey || !base) return fallback
  try {
    const res = await fetch(`${base}${endpoint}`, {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`SivaBot API error: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[SivaBot] Internal API fetch failed, using mock data:', err)
    return fallback
  }
}

// ── Public API ────────────────────────────────────────────────────

export async function getStrategies(): Promise<Strategy[]> {
  if (DATA_PROVIDER === 'sivabot_internal') {
    return fetchFromSivaBot<Strategy[]>('/strategies', MOCK_STRATEGIES)
  }
  // PeakBot — map their response shape to our Strategy type
  const raw = await fetchFromPeakBot<Strategy[]>('/v1/strategies', MOCK_STRATEGIES)
  return raw
}

export async function getPortfolioHistory(userId: string): Promise<PortfolioSnapshot[]> {
  if (DATA_PROVIDER === 'sivabot_internal') {
    return fetchFromSivaBot<PortfolioSnapshot[]>(`/users/${userId}/portfolio`, MOCK_PORTFOLIO)
  }
  return fetchFromPeakBot<PortfolioSnapshot[]>(`/v1/users/${userId}/portfolio`, MOCK_PORTFOLIO)
}

export async function getUserStrategies(userId: string): Promise<UserStrategy[]> {
  // Always from Supabase (user's own subscription data)
  // Populated when user subscribes to a strategy
  return []
}

export { MOCK_STRATEGIES, MOCK_PORTFOLIO }
