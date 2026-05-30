'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  async function handleAppleSignup() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'var(--black)'}}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:'var(--green-dark)',border:'1px solid var(--green)'}}>
          <span style={{color:'var(--green)',fontSize:28}}>✓</span>
        </div>
        <h2 className="font-display text-2xl mb-3" style={{color:'#f0f8f4'}}>Check your email</h2>
        <p style={{color:'var(--muted)'}}>We sent a confirmation link to <strong style={{color:'var(--text)'}}>{email}</strong>. Click it to activate your account.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'var(--black)'}}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage:'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
        backgroundSize:'60px 60px',
        maskImage:'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 100%)'
      }}/>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="font-display text-3xl" style={{color:'var(--green)'}}>Siva</span>
            <span className="font-display text-3xl" style={{color:'var(--text)'}}>Bot</span>
          </Link>
          <p className="mt-3 text-sm" style={{color:'var(--muted)'}}>Create your free account</p>
        </div>

        <div className="rounded-lg border p-8" style={{background:'var(--deep)',borderColor:'var(--border)'}}>
          <button onClick={handleAppleSignup} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded border font-medium text-sm transition-all mb-6"
            style={{borderColor:'rgba(255,255,255,0.15)',color:'var(--text)',background:'rgba(255,255,255,0.04)'}}
            onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--green)')}
            onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}>
            <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 523 0 342.3 0 223.4c0-208.1 135.5-318.1 268.8-318.1 70.6 0 129.5 46.4 173.9 46.4 42.8 0 109.8-49 189.5-49 30.6 0 130.3 2.6 198.3 99.2z"/>
            </svg>
            Continue with Apple
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
            <span className="text-xs" style={{color:'var(--muted)'}}>or</span>
            <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              {label:'Full Name',type:'text',val:fullName,set:setFullName,ph:'John Smith'},
              {label:'Email',type:'email',val:email,set:setEmail,ph:'you@example.com'},
              {label:'Password',type:'password',val:password,set:setPassword,ph:'Min 8 characters'},
            ].map(({label,type,val,set,ph})=>(
              <div key={label}>
                <label className="block text-xs mb-2 font-mono-custom tracking-widest uppercase" style={{color:'var(--muted)'}}>{label}</label>
                <input type={type} value={val} onChange={e=>set(e.target.value)} required placeholder={ph} minLength={type==='password'?8:undefined}
                  className="w-full px-4 py-3 rounded border text-sm outline-none transition-all"
                  style={{background:'var(--black)',borderColor:'var(--border)',color:'var(--text)'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--green)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}
                />
              </div>
            ))}

            {error && <div className="text-sm px-4 py-3 rounded border" style={{color:'#ff6b6b',background:'rgba(255,107,107,0.08)',borderColor:'rgba(255,107,107,0.2)'}}>{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded font-semibold text-sm transition-all mt-2"
              style={{background:'var(--green)',color:'var(--black)'}}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--green-dim)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--green)')}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{color:'var(--muted)'}}>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium" style={{color:'var(--green)'}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
