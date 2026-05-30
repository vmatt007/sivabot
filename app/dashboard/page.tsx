'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2, Zap } from 'lucide-react'
import type { PortfolioSnapshot, Strategy } from '@/types'
import { MOCK_PORTFOLIO, MOCK_STRATEGIES } from '@/lib/strategies'
import { PROVIDER_LABEL } from '@/config/dataProvider'

function StatCard({ label, value, sub, up, icon: Icon }: any) {
  return (
    <div className="rounded-lg border p-6 transition-all" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono-custom tracking-widest uppercase" style={{color:'var(--muted)'}}>{label}</span>
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'rgba(0,232,122,0.08)'}}>
          <Icon size={14} style={{color:'var(--green)'}} />
        </div>
      </div>
      <div className="font-display text-3xl mb-1" style={{color:'#f0f8f4',letterSpacing:'-1px'}}>{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs">
          {up ? <TrendingUp size={11} style={{color:'var(--green)'}} /> : <TrendingDown size={11} style={{color:'#ff6b6b'}} />}
          <span style={{color: up ? 'var(--green)' : '#ff6b6b'}}>{sub}</span>
        </div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border px-3 py-2 text-xs" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
      <p style={{color:'var(--muted)'}}>{label}</p>
      <p className="font-semibold mt-1" style={{color:'var(--green)'}}>
        ${payload[0].value?.toLocaleString()}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In production these fetch from /api/strategies and /api/portfolio
    setTimeout(() => {
      setPortfolio(MOCK_PORTFOLIO)
      setStrategies(MOCK_STRATEGIES.slice(0, 3))
      setLoading(false)
    }, 600)
  }, [])

  const latest = portfolio[portfolio.length - 1]
  const prev = portfolio[portfolio.length - 2]
  const dayChange = latest && prev ? latest.value - prev.value : 0
  const dayChangePct = prev ? (dayChange / prev.value * 100).toFixed(2) : '0'

  const chartData = portfolio.map(p => ({
    date: p.date.slice(5), // MM-DD
    value: p.value,
    pnl: p.pnl,
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono-custom tracking-widest uppercase mb-1" style={{color:'var(--green)'}}>Dashboard</p>
          <h1 className="font-display text-3xl" style={{color:'#f0f8f4',letterSpacing:'-1px'}}>Overview</h1>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded border font-mono-custom"
          style={{background:'var(--green-dark)',borderColor:'var(--green)',color:'var(--green)'}}>
          <span className="w-2 h-2 rounded-full animate-blink inline-block" style={{background:'var(--green)'}}/>
          Live via {PROVIDER_LABEL}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Portfolio Value" value={latest ? `$${latest.value.toLocaleString()}` : '—'} sub={`${dayChange >= 0 ? '+' : ''}$${dayChange.toLocaleString()} today`} up={dayChange >= 0} icon={DollarSign} />
        <StatCard label="Total P&L" value={latest ? `${latest.pnl >= 0 ? '+' : ''}$${latest.pnl.toLocaleString()}` : '—'} sub={`${latest?.pnl_pct >= 0 ? '+' : ''}${latest?.pnl_pct}% all time`} up={(latest?.pnl ?? 0) >= 0} icon={TrendingUp} />
        <StatCard label="Active Strategies" value={strategies.length} sub="Automating now" up={true} icon={Zap} />
        <StatCard label="Avg Win Rate" value={strategies.length ? `${(strategies.reduce((a,s)=>a+s.win_rate,0)/strategies.length).toFixed(1)}%` : '—'} sub="Across active bots" up={true} icon={BarChart2} />
      </div>

      {/* Portfolio Chart */}
      <div className="rounded-lg border p-6 mb-8" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-mono-custom tracking-widest uppercase mb-1" style={{color:'var(--muted)'}}>Portfolio Balance</p>
            <p className="font-display text-2xl" style={{color:'#f0f8f4'}}>30-Day Performance</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{color:'var(--muted)'}}>Total Return</p>
            <p className="font-semibold" style={{color:'var(--green)'}}>
              +{latest?.pnl_pct ?? 0}%
            </p>
          </div>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center" style={{color:'var(--muted)'}}>
            <Activity size={20} className="animate-pulse mr-2" /> Loading chart…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e87a" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#00e87a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,232,122,0.06)" />
              <XAxis dataKey="date" tick={{fill:'#7a9e8a',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#7a9e8a',fontSize:11}} axisLine={false} tickLine={false}
                tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#00e87a" strokeWidth={2}
                fill="url(#portfolioGrad)" dot={false} activeDot={{r:4,fill:'#00e87a'}} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Active Strategies */}
      <div className="rounded-lg border" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
          <p className="font-display text-lg" style={{color:'#f0f8f4'}}>Active Strategies</p>
          <a href="/dashboard/strategies" className="text-xs font-mono-custom" style={{color:'var(--green)'}}>View all →</a>
        </div>
        <div>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{color:'var(--muted)'}}>Loading strategies…</div>
          ) : strategies.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded flex items-center justify-center font-display text-sm" style={{background:'var(--green-dark)',color:'var(--green)',border:'1px solid var(--border)'}}>
                  {s.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{color:'var(--text)'}}>{s.name}</p>
                  <p className="text-xs" style={{color:'var(--muted)'}}>{s.asset_class}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs" style={{color:'var(--muted)'}}>Win Rate</p>
                  <p className="text-sm font-semibold" style={{color:'var(--green)'}}>{s.win_rate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{color:'var(--muted)'}}>Monthly</p>
                  <p className="text-sm font-semibold" style={{color:'var(--green)'}}>+{s.monthly_return}%</p>
                </div>
                <div className="w-2 h-2 rounded-full animate-blink" style={{background:'var(--green)'}} title="Active" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
