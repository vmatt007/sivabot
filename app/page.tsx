'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

const TICKS = [
  {sym:'SPX',price:'5,284.21',chg:'+0.42%',up:true},
  {sym:'QQQ',price:'449.87',chg:'+0.61%',up:true},
  {sym:'TSLA',price:'188.34',chg:'-1.12%',up:false},
  {sym:'AAPL',price:'211.22',chg:'+0.28%',up:true},
  {sym:'SPY',price:'528.74',chg:'+0.39%',up:true},
  {sym:'NVDA',price:'124.56',chg:'+2.14%',up:true},
  {sym:'AMZN',price:'193.41',chg:'-0.33%',up:false},
  {sym:'VIX',price:'14.21',chg:'-0.81%',up:false},
  {sym:'GLD',price:'312.55',chg:'+0.17%',up:true},
  {sym:'IWM',price:'204.33',chg:'+0.55%',up:true},
]

const STRATEGIES = [
  {name:'King AI Iron Condors',asset:'SPX Options',win:'85%+',since:'Sep 2025'},
  {name:'10% Per Month',asset:'Credit Spreads · SPX',win:'94%+',since:'Jan 2024'},
  {name:'BullTrade Credit Spreads',asset:'Long Options',win:'90%+',since:'Oct 2025'},
  {name:'The Wheel Strategy',asset:'Equities',win:'78%+',since:'Dec 2022'},
]

export default function HomePage() {
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const syms = ['^GSPC','QQQ','TSLA','AAPL','SPY','NVDA','AMZN','^VIX','GLD','IWM']
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms.join('%2C')}&fields=regularMarketPrice,regularMarketChangePercent`
        const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        const res = await fetch(proxy)
        const outer = await res.json()
        const data = JSON.parse(outer.contents)
        const quotes = data?.quoteResponse?.result
        if (!quotes?.length) return
        const labels = ['SPX','QQQ','TSLA','AAPL','SPY','NVDA','AMZN','VIX','GLD','IWM']
        const items = quotes.map((q: any, i: number) => {
          const chg = q.regularMarketChangePercent ?? 0
          const price = q.regularMarketPrice >= 1000
            ? q.regularMarketPrice.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
            : q.regularMarketPrice.toFixed(2)
          return `<div style="display:flex;align-items:center;gap:10px;white-space:nowrap;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#7a9e8a">
            <span style="color:#d4e8dc;font-weight:600">${labels[i]}</span>
            <span>${price}</span>
            <span style="color:${chg>=0?'#00e87a':'#ff5a5a'}">${chg>=0?'+':''}${chg.toFixed(2)}%</span>
          </div>`
        })
        if (tickerRef.current) {
          const html = [...items,...items].join('')
          tickerRef.current.innerHTML = html
        }
      } catch {}
    }
    fetchPrices()
    const id = setInterval(fetchPrices, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{background:'#080c0a',minHeight:'100vh',color:'#d4e8dc',fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 48px',background:'rgba(8,12,10,0.85)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,232,122,0.12)'}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#00e87a'}}>
          Siva<span style={{color:'#d4e8dc'}}>Bot</span>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <Link href="/auth/login" style={{color:'#7a9e8a',textDecoration:'none',fontSize:14}}>Sign In</Link>
          <Link href="/auth/signup" style={{background:'#00e87a',color:'#080c0a',padding:'10px 22px',borderRadius:4,fontWeight:600,fontSize:13,textDecoration:'none'}}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'120px 48px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,232,122,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(0,232,122,0.12) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)'}}/>
        <div style={{position:'absolute',width:600,height:600,background:'radial-gradient(circle,rgba(0,232,122,0.08) 0%,transparent 70%)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',maxWidth:720}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#002a18',border:'1px solid #00e87a',color:'#00e87a',padding:'6px 14px',borderRadius:100,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,marginBottom:32,letterSpacing:'0.08em'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#00e87a',display:'inline-block',animation:'blink 1.4s ease-in-out infinite'}}/>
            Live algorithms trading now
          </div>
          <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(42px,6vw,76px)',lineHeight:1.05,letterSpacing:'-1.5px',marginBottom:28,color:'#f0f8f4'}}>
            Trade Smarter.<br/><em style={{color:'#00e87a'}}>Automatically.</em>
          </h1>
          <p style={{fontSize:18,color:'#7a9e8a',maxWidth:500,marginBottom:44,lineHeight:1.7}}>
            SivaBot connects you to battle-tested algorithmic strategies. Browse, subscribe, and let the bots do the work.
          </p>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            <Link href="/auth/signup" style={{background:'#00e87a',color:'#080c0a',padding:'16px 32px',borderRadius:4,fontWeight:600,fontSize:15,textDecoration:'none',boxShadow:'0 0 30px rgba(0,232,122,0.25)'}}>
              Start Free
            </Link>
            <Link href="/auth/login" style={{border:'1px solid rgba(0,232,122,0.12)',color:'#d4e8dc',padding:'16px 32px',borderRadius:4,fontSize:15,textDecoration:'none'}}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{background:'#002a18',borderTop:'1px solid rgba(0,232,122,0.12)',borderBottom:'1px solid rgba(0,232,122,0.12)',padding:'12px 0',overflow:'hidden'}}>
        <div ref={tickerRef} style={{display:'flex',gap:60,animation:'ticker 35s linear infinite',width:'max-content'}}>
          {[...TICKS,...TICKS].map((t,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,whiteSpace:'nowrap',fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'#7a9e8a'}}>
              <span style={{color:'#d4e8dc',fontWeight:600}}>{t.sym}</span>
              <span>{t.price}</span>
              <span style={{color:t.up?'#00e87a':'#ff5a5a'}}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{padding:'80px 48px'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#00e87a',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:16}}>Platform</p>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(32px,4vw,52px)',letterSpacing:'-1px',color:'#f0f8f4',marginBottom:16}}>Built for serious traders</h2>
          <p style={{color:'#7a9e8a',fontSize:17,maxWidth:500,margin:'0 auto'}}>Real algorithms, verified performance, automated execution.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(0,232,122,0.12)',maxWidth:900,margin:'0 auto'}}>
          {[
            {num:'94%',label:'Avg. win rate'},
            {num:'30+',label:'Live algorithms'},
            {num:'<3s',label:'Trade execution'},
            {num:'$0',label:'Trade commissions'},
          ].map(s=>(
            <div key={s.label} style={{background:'#0d1410',padding:'40px 36px'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:52,color:'#00e87a',letterSpacing:'-2px'}}>{s.num}</div>
              <div style={{color:'#7a9e8a',fontSize:14,marginTop:6}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STRATEGIES */}
      <section style={{padding:'80px 48px',background:'#0d1410'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#00e87a',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:16}}>Marketplace</p>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(32px,4vw,52px)',letterSpacing:'-1px',color:'#f0f8f4',marginBottom:16}}>Live Strategies</h2>
          <p style={{color:'#7a9e8a',fontSize:17,maxWidth:500,margin:'0 auto'}}>Every strategy is live-traded with verified performance history.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:2,background:'rgba(0,232,122,0.12)',maxWidth:1100,margin:'0 auto'}}>
          {STRATEGIES.map(s=>(
            <div key={s.name} style={{background:'#080c0a',padding:'32px 28px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div style={{width:36,height:36,borderRadius:6,background:'#002a18',border:'1px solid rgba(0,232,122,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Serif Display',serif",color:'#00e87a',fontSize:16}}>
                  {s.name[0]}
                </div>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#00e87a',background:'#002a18',border:'1px solid #00e87a',padding:'2px 8px',borderRadius:100}}>
                  {s.win} Win
                </span>
              </div>
              <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#f0f8f4',marginBottom:8}}>{s.name}</h3>
              <p style={{fontSize:13,color:'#7a9e8a',marginBottom:16}}>{s.asset}</p>
              <p style={{fontSize:12,color:'#7a9e8a',fontFamily:"'IBM Plex Mono',monospace"}}>Live since {s.since}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:40}}>
          <Link href="/auth/signup" style={{background:'#00e87a',color:'#080c0a',padding:'16px 40px',borderRadius:4,fontWeight:600,fontSize:15,textDecoration:'none',display:'inline-block'}}>
            View All Strategies →
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section style={{padding:'80px 48px'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#00e87a',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:16}}>Pricing</p>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(32px,4vw,52px)',letterSpacing:'-1px',color:'#f0f8f4'}}>Simple, transparent plans</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:2,background:'rgba(0,232,122,0.12)',maxWidth:900,margin:'0 auto'}}>
          {[
            {tier:'Starter',price:'$29',desc:'1 active strategy',features:['1 strategy','Broker sync','Trade alerts','Dashboard']},
            {tier:'Pro',price:'$79',desc:'Most popular',features:['Unlimited strategies','Priority execution','Multi-ticker','SMS alerts'],featured:true},
            {tier:'Trader',price:'$199',desc:'Publish your own',features:['Everything in Pro','Publish strategies','Earn revenue','Onboarding']},
          ].map(p=>(
            <div key={p.tier} style={{background: p.featured ? '#002a18' : '#0d1410',padding:'40px 32px',border: p.featured ? '1px solid #00e87a' : 'none'}}>
              {p.featured && <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#080c0a',background:'#00e87a',padding:'3px 10px',borderRadius:100,display:'inline-block',marginBottom:16,letterSpacing:'0.1em'}}>POPULAR</div>}
              <div style={{color:'#7a9e8a',fontSize:13,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>{p.tier}</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:52,color:'#f0f8f4',letterSpacing:'-2px',marginBottom:8}}>{p.price}<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,color:'#7a9e8a'}}>/mo</span></div>
              <p style={{color:'#7a9e8a',fontSize:14,marginBottom:24}}>{p.desc}</p>
              <ul style={{listStyle:'none',padding:0,marginBottom:32,display:'flex',flexDirection:'column',gap:10}}>
                {p.features.map(f=>(
                  <li key={f} style={{fontSize:14,color:'#d4e8dc',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{color:'#00e87a',fontWeight:700,fontSize:12}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" style={{display:'block',textAlign:'center',padding:'14px',borderRadius:4,textDecoration:'none',fontWeight:600,fontSize:14,background: p.featured ? '#00e87a' : 'transparent',color: p.featured ? '#080c0a' : '#d4e8dc',border: p.featured ? 'none' : '1px solid rgba(0,232,122,0.12)'}}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(0,232,122,0.12)',padding:'40px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#00e87a'}}>Siva<span style={{color:'#d4e8dc'}}>Bot</span></div>
        <p style={{color:'#7a9e8a',fontSize:13}}>© 2026 SivaBot. Not financial advice.</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  )
}
