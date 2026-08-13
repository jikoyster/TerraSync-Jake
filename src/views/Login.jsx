import { useState } from 'react'

export default function Login() {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMessage(''); setError('')
    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setMessage('Account created. Check your email if email confirmation is enabled.')
          setMode('sign-in')
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand login-brand">
          <div className="brand-mark"><Leaf size={24} strokeWidth={2.2} /></div>
          <span>Terra<span>Sync</span></span>
        </div>
        <div className="login-title">
          <h1>{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
          <p>{mode === 'sign-in' ? 'Sign in to manage your cooperative data.' : 'Create a Supabase account to access TerraSync.'}</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}
          <button className="primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}</button>
        </form>
        <button className="text-button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); setMessage('') }}>
          {mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}