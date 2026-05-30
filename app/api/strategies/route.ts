import { NextResponse } from 'next/server'
import { getStrategies } from '@/lib/strategies'

export async function GET() {
  try {
    const strategies = await getStrategies()
    return NextResponse.json(strategies)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
