// ─────────────────────────────────────────────────────────────────
//  config/dataProvider.ts
//  Change NEXT_PUBLIC_DATA_PROVIDER in .env.local to switch sources
//  "peakbot"           → live PeakBot API
//  "sivabot_internal"  → your own future API
// ─────────────────────────────────────────────────────────────────

export type DataProvider = 'peakbot' | 'sivabot_internal'

export const DATA_PROVIDER: DataProvider =
  (process.env.NEXT_PUBLIC_DATA_PROVIDER as DataProvider) ?? 'peakbot'

export const PROVIDER_LABEL =
  DATA_PROVIDER === 'peakbot' ? 'PeakBot' : 'SivaBot'

// ── Endpoint resolver ─────────────────────────────────────────────
export function getApiBase(): string {
  if (DATA_PROVIDER === 'sivabot_internal') {
    return process.env.SIVABOT_API_URL ?? ''
  }
  return process.env.PEAKBOT_API_URL ?? 'https://api.peakbot.com'
}

export function getApiKey(): string {
  if (DATA_PROVIDER === 'sivabot_internal') {
    return process.env.SIVABOT_API_KEY ?? ''
  }
  return process.env.PEAKBOT_API_KEY ?? ''
}
