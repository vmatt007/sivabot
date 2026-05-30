import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, TrendingUp, LineChart, CreditCard, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/strategies', label: 'Strategies', icon: TrendingUp },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: LineChart },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="flex min-h-screen" style={{background:'var(--black)'}}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{borderColor:'var(--border)'}}>
          <Link href="/">
            <span className="font-display text-xl" style={{color:'var(--green)'}}>Siva</span>
            <span className="font-display text-xl" style={{color:'var(--text)'}}>Bot</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all group"
              style={{color:'var(--muted)'}}
              onMouseEnter={e=>{e.currentTarget.style.color='var(--green)';e.currentTarget.style.background='rgba(0,232,122,0.06)'}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.background='transparent'}}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + Signout */}
        <div className="px-3 py-4 border-t" style={{borderColor:'var(--border)'}}>
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium truncate" style={{color:'var(--text)'}}>{user.user_metadata?.full_name || 'Trader'}</p>
            <p className="text-xs truncate" style={{color:'var(--muted)'}}>{user.email}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm w-full transition-all"
              style={{color:'var(--muted)'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#ff6b6b';e.currentTarget.style.background='rgba(255,107,107,0.06)'}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.background='transparent'}}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
