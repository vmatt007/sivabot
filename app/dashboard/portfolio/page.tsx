'use client'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { MOCK_PORTFOLIO, MOCK_STRATEGIES } from '@/lib/strategies'
import type { PortfolioSnapshot, Strategy } from '@/types'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border px-3 py-2 text-xs" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
      <p style={{color:'var(--muted)'}}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold mt-0.5" style={{color: p.value >= 0 ? 'var(--green)' : '#ff6b6b'}}>
          {p.name}: {p.value >= 0 ? '+' : ''}${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [range, setRange] = useState<7|14|30>(30)

  useEffect(() => {
    setPortfolio(MOCK_PORTFOLIO)
    setStrategies(MOCK_STRATEGIES)
  }, [])

  const sliced = portfolio.slice(-range)
  const chartData = sliced.map(p => ({
    date: p.date.slice(5),
    value: p.value,
    pnl: p.pnl,
    daily: sliced.indexOf(p) > 0
      ? p.value - sliced[sliced.indexOf(p) - 1].value
      : 0,
  }))

  const latest = portfolio[portfolio.length - 1]
  const start = sliced[0]
  const rangeReturn = latest && start ? ((latest.value - start.value) / start.value * 100).toFixed(2) : '0'
  const rangeGain = latest && start ? latest.value - start.value : 0

  // Strategy allocation breakdown (mock)
  const alloc = strategies.slice(0,4).map((s, i) => ({
    name: s.name.split(' ').slice(0,2).join(' '),
    pct: [40, 30, 20, 10][i],
    color: ['#00e87a','#00c464','#009948','#006830'][i],
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-mono-custom tracking-widest uppercase mb-1" style={{color:'var(--green)'}}>Analytics</p>
        <h1 className="font-display text-3xl" style={{color:'#f0f8f4',letterSpacing:'-1px'}}>Portfolio</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {label:'Current Value', val: latest ? `$${latest.value.toLocaleString()}` : '—'},
          {label:`${range}D Return`, val: `${Number(rangeReturn)>=0?'+':''}${rangeReturn}%`},
          {label:`${range}D Gain`, val: `${rangeGain>=0?'+':''}$${rangeGain.toLocaleString()}`},
          {label:'All-Time P&L', val: latest ? `+$${latest.pnl.toLocaleString()}` : '—'},
        ].map(({label,val})=>(
          <div key={label} className="rounded-lg border p-5" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
            <p className="text-xs font-mono-custom tracking-widest uppercase mb-2" style={{color:'var(--muted)'}}>{label}</p>
            <p className="font-display text-2xl" style={{color: val.includes('-') ? '#ff9a9a' : 'var(--green)',letterSpacing:'-0.5px'}}>{val}</p>
          </div>
        ))}
      </div>

      {/* Balance Chart */}
      <div className="rounded-lg border p-6 mb-6" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
        <div className="flex items-center justify-between mb-6">
          <p className="font-display text-xl" style={{color:'#f0f8f4'}}>Balance History</p>
          <div className="flex gap-2">
            {([7,14,30] as const).map(r=>(
              <button key={r} onClick={()=>setRange(r)}
                className="px-3 py-1 rounded text-xs font-mono-custom transition-all"
                style={{
                  background: range===r ? 'var(--green)' : 'transparent',
                  color: range===r ? 'var(--black)' : 'var(--muted)',
                  border:`1px solid ${range===r ? 'var(--green)' : 'var(--border)'}`,
                }}>
                {r}D
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e87a" stopOpacity={0.18}/>
                <stop offset="95%" stopColor="#00e87a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,232,122,0.06)" />
            <XAxis dataKey="date" tick={{fill:'#7a9e8a',fontSize:11}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill:'#7a9e8a',fontSize:11}} axisLine={false} tickLine={false}
              tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" name="Balance" stroke="#00e87a" strokeWidth={2}
              fill="url(#balGrad)" dot={false} activeDot={{r:4,fill:'#00e87a'}} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily P&L + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily P&L Bar */}
        <div className="rounded-lg border p-6" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
          <p className="font-display text-xl mb-6" style={{color:'#f0f8f4'}}>Daily P&L</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,232,122,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{fill:'#7a9e8a',fontSize:10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#7a9e8a',fontSize:10}} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="daily" name="Daily P&L" radius={[3,3,0,0]}>
                {chartData.slice(-14).map((entry, index) => (
                  <Cell key={index} fill={entry.daily >= 0 ? '#00e87a' : '#ff6b6b'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strategy Allocation */}
        <div className="rounded-lg border p-6" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
          <p className="font-display text-xl mb-6" style={{color:'#f0f8f4'}}>Strategy Allocation</p>
          <div className="space-y-4">
            {alloc.map(a => (
              <div key={a.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{color:'var(--text)'}}>{a.name}</span>
                  <span style={{color:a.color}}>{a.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${a.pct}%`,background:a.color}} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t" style={{borderColor:'var(--border)'}}>
            <div className="flex justify-between text-xs">
              <span style={{color:'var(--muted)'}}>Total Allocated</span>
              <span style={{color:'var(--green)'}}>$25,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
