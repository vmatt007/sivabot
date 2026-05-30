'use client'
import { useEffect, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Zap, TrendingUp, Shield, Clock } from 'lucide-react'
import type { Strategy } from '@/types'
import { MOCK_STRATEGIES } from '@/lib/strategies'
import { PROVIDER_LABEL } from '@/config/dataProvider'

function WinRateBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(0,232,122,0.1)'}}>
      <div className="h-full rounded-full" style={{width:`${value}%`,background:'var(--green)',transition:'width 0.6s ease'}} />
    </div>
  )
}

function StrategyCard({ s, onSubscribe }: { s: Strategy; onSubscribe: (s: Strategy) => void }) {
  const radarData = [
    { axis: 'Win Rate', value: s.win_rate },
    { axis: 'Returns', value: Math.min(s.monthly_return * 8, 100) },
    { axis: 'Safety', value: Math.max(0, 100 + s.max_drawdown * 5) },
    { axis: 'History', value: Math.min(s.total_trades / 12, 100) },
  ]
  return (
    <div className="rounded-lg border flex flex-col transition-all" style={{background:'var(--deep)',borderColor:'var(--border)'}}
      onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--green)')}
      onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b" style={{borderColor:'var(--border)'}}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium text-sm mb-0.5" style={{color:'#f0f8f4'}}>{s.name}</p>
            <p className="text-xs" style={{color:'var(--muted)'}}>{s.asset_class}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-mono-custom" style={{background:'var(--green-dark)',color:'var(--green)',border:'1px solid var(--green)'}}>
            {s.win_rate}% Win
          </span>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {s.tags.slice(0,3).map(t=>(
            <span key={t} className="text-xs px-2 py-0.5 rounded" style={{background:'rgba(0,232,122,0.06)',color:'var(--muted)',border:'1px solid var(--border)'}}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="px-4 py-2 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,232,122,0.1)" />
            <PolarAngleAxis dataKey="axis" tick={{fill:'#7a9e8a',fontSize:9}} />
            <Radar dataKey="value" stroke="#00e87a" fill="#00e87a" fillOpacity={0.12} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 grid grid-cols-3 gap-2 border-t border-b" style={{borderColor:'var(--border)'}}>
        {[
          {label:'Monthly',val:`+${s.monthly_return}%`,good:true},
          {label:'Max DD',val:`${s.max_drawdown}%`,good:false},
          {label:'Trades',val:s.total_trades.toString(),good:true},
        ].map(({label,val,good})=>(
          <div key={label} className="text-center">
            <p className="text-xs mb-0.5" style={{color:'var(--muted)'}}>{label}</p>
            <p className="text-sm font-semibold" style={{color: good ? 'var(--green)' : '#ff9a9a'}}>{val}</p>
          </div>
        ))}
      </div>

      {/* Win Rate Bar */}
      <div className="px-5 py-3">
        <div className="flex justify-between text-xs mb-1.5" style={{color:'var(--muted)'}}>
          <span>Win Rate</span><span style={{color:'var(--green)'}}>{s.win_rate}%</span>
        </div>
        <WinRateBar value={s.win_rate} />
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 mt-auto">
        <div className="flex items-center justify-between mb-3 text-xs" style={{color:'var(--muted)'}}>
          <span className="flex items-center gap-1"><Clock size={10}/> Live since {s.live_since}</span>
          <span className="flex items-center gap-1"><Shield size={10}/> {s.provider}</span>
        </div>
        <button onClick={()=>onSubscribe(s)}
          className="w-full py-2.5 rounded text-sm font-semibold transition-all"
          style={{background:'var(--green)',color:'var(--black)'}}
          onMouseEnter={e=>(e.currentTarget.style.background='var(--green-dim)')}
          onMouseLeave={e=>(e.currentTarget.style.background='var(--green)')}>
          <Zap size={13} className="inline mr-1.5" />
          Automate — ${s.price_monthly}/mo
        </button>
      </div>
    </div>
  )
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [toast, setToast] = useState('')

  useEffect(() => {
    setTimeout(() => { setStrategies(MOCK_STRATEGIES); setLoading(false) }, 500)
  }, [])

  const tags = ['All', 'SPX', 'Options', 'Equities', 'Credit Spreads', 'AI']
  const filtered = filter === 'All' ? strategies : strategies.filter(s => s.tags.includes(filter))

  function handleSubscribe(s: Strategy) {
    setToast(`Redirecting to checkout for "${s.name}"…`)
    setTimeout(() => setToast(''), 3000)
    // In production: POST /api/stripe/checkout with { strategyId: s.id }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-mono-custom tracking-widest uppercase mb-1" style={{color:'var(--green)'}}>Marketplace</p>
          <h1 className="font-display text-3xl" style={{color:'#f0f8f4',letterSpacing:'-1px'}}>Strategies</h1>
          <p className="text-sm mt-1" style={{color:'var(--muted)'}}>Powered by {PROVIDER_LABEL} · All live-traded, verified performance</p>
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {tags.map(t => (
            <button key={t} onClick={()=>setFilter(t)}
              className="px-3 py-1.5 rounded text-xs font-mono-custom transition-all"
              style={{
                background: filter===t ? 'var(--green)' : 'transparent',
                color: filter===t ? 'var(--black)' : 'var(--muted)',
                border: `1px solid ${filter===t ? 'var(--green)' : 'var(--border)'}`,
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i=>(
            <div key={i} className="rounded-lg border h-80 animate-pulse" style={{background:'var(--deep)',borderColor:'var(--border)'}} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <StrategyCard key={s.id} s={s} onSubscribe={handleSubscribe} />)}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-lg border text-sm font-medium shadow-xl"
          style={{background:'var(--deep)',borderColor:'var(--green)',color:'var(--green)'}}>
          {toast}
        </div>
      )}
    </div>
  )
}
