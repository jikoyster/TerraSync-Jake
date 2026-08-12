import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRightFromLine, Bell, BriefcaseBusiness, Building2, Check,
  ChevronDown, Edit3, Leaf, Menu, Plus, Search, Settings, ShieldCheck,
  Sprout, Trash2, Tractor, UserRound, Users, X
} from 'lucide-react'
import { supabase } from './supabase'

const EMPTY_FORM = {
  rsbsa_number: '',
  name: '',
  crops: '',
  status: 'active',
  address: '',
  email: '',
  phone: ''
}

function App() {
  const [session, setSession] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
      if (mounted) setLoadingAuth(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoadingAuth(false)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loadingAuth) return <div className="screen-center"><Spinner /></div>
  if (!session) return <Login />

  return <Dashboard session={session} />
}

function Spinner() {
  return <div className="spinner" aria-label="Loading" />
}

function Login() {
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

function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('farmers')
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewingFarmer, setViewingFarmer] = useState(null)
  const [now, setNow] = useState(new Date())
  const [forecast, setForecast] = useState({
    season: 'Habagat Season',
    condition: 'Partly Cloudy',
    temp: '25–32°C',
    advisory: 'Afternoon showers likely. Bring rain gear.'
  })

  async function loadFarmers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .order('farmer_id', { ascending: true })
    if (error) {
      showNotice(error.message, 'error')
    } else {
      setFarmers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { loadFarmers() }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 60)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const conditions = [
      { condition: 'Partly Cloudy', temp: '25–32°C', advisory: 'Afternoon showers likely. Bring rain gear.' },
      { condition: 'Cloudy with Rain', temp: '24–30°C', advisory: 'Heavy rainfall expected. Monitor PAGASA updates.' },
      { condition: 'Mostly Sunny', temp: '26–33°C', advisory: 'UV index high. Use sun protection.' },
      { condition: 'Scattered Showers', temp: '25–31°C', advisory: 'Light to moderate rains in the afternoon.' },
      { condition: 'Thunderstorms', temp: '24–29°C', advisory: 'Signal warnings may be raised. Stay indoors if needed.' }
    ]
    const hour = new Date().getHours()
    const idx = hour % conditions.length
    setForecast({ season: 'Habagat Season', ...conditions[idx] })
  }, [now])

  function showNotice(text, type = 'success') {
    setNotice({ text, type })
    window.clearTimeout(window.__terraNotice)
    window.__terraNotice = window.setTimeout(() => setNotice(null), 4500)
  }

  async function toggleStatus(farmer) {
    const next = farmer.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('farmers')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('farmer_id', farmer.farmer_id)
    if (error) {
      showNotice(error.message, 'error')
    } else {
      showNotice(`Farmer marked as ${next}.`)
      setFarmers(prev => prev.map(f => f.farmer_id === farmer.farmer_id ? { ...f, status: next, updated_at: new Date().toISOString() } : f))
    }
  }

  async function saveFarmer(values) {
    if (modal === 'create') {
      const { error } = await supabase.from('farmers').insert([values])
      if (error) throw error
      showNotice('Farmer created successfully.')
    } else {
      const { error } = await supabase
        .from('farmers')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('farmer_id', selected.farmer_id)
      if (error) throw error
      showNotice('Farmer updated successfully.')
    }
    setModal(null); setSelected(null)
    await loadFarmers()
  }

  async function deleteFarmer() {
    if (!deleteTarget) return
    const { error } = await supabase.from('farmers').delete().eq('farmer_id', deleteTarget.farmer_id)
    if (error) {
      showNotice(error.message, 'error')
    } else {
      showNotice('Farmer deleted.')
      await loadFarmers()
    }
    setDeleteTarget(null)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return farmers
    return farmers.filter(f =>
      [f.rsbsa_number, f.name, f.crops, f.status, f.address, f.email]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [farmers, query])

  const stats = useMemo(() => ({
    total: farmers.length,
    active: farmers.filter(f => f.status === 'active').length,
    inactive: farmers.filter(f => f.status === 'inactive').length
  }), [farmers])

  const email = session.user?.email || 'Manager'
  const displayName = email.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BriefcaseBusiness },
    { id: 'farmers', label: 'Farmers', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'coop', label: 'Co-op', icon: Tractor },
    { id: 'admin', label: 'Admin', icon: Settings }
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Leaf size={24} strokeWidth={2.2} /></div>
          <span>Terra<span>Sync</span></span>
        </div>
        <button className="signout" onClick={() => supabase.auth.signOut()}>
          <ArrowRightFromLine size={17} /> Sign Out
        </button>
      </header>

        <section className="manager-bar">
          <div>
            <h2 className="hidden">Co-op Manager</h2>
            <div className="manager-sub">
              <span>Mindanao Valley Co-operative</span>
              <PagasaForecast forecast={forecast} />
            </div>
          </div>
          <div className="manager-actions">
            <button className="secondary">Switch to Vendor View</button>
            <button className="secondary">Switch to Farmer View</button>
            <button className="notification"><Bell size={19} /><b>0</b></button>
            <div className="profile">
              <div className="avatar"><UserRound size={19} /></div>
              <div><strong>{displayName}</strong><small>Co-op Manager</small></div>
              <ChevronDown size={16} className="profile-chevron" />
            </div>
          </div>
        </section>

      {/* Tabs hidden for now
      <nav className="tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeTab === id ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>
      */}

      <main className="content">
        {notice && <div className={`toast ${notice.type}`}>{notice.type === 'success' ? <Check size={17}/> : <X size={17}/>} {notice.text}</div>}

        {viewingFarmer ? (
          <FarmerProfile
            farmer={viewingFarmer}
            onBack={() => setViewingFarmer(null)}
            onEdit={() => { setSelected(viewingFarmer); setModal('edit'); setViewingFarmer(null) }}
            onDelete={() => { setDeleteTarget(viewingFarmer); setViewingFarmer(null) }}
            onToggle={toggleStatus}
          />
        ) : activeTab === 'farmers' ? (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow"><Sprout size={16}/> Farmer Registry</div>
                <h1>Registered Farmers</h1>
                <p>View and manage the farmers registered with your cooperative.</p>
              </div>
              <button className="primary" onClick={() => { setSelected(null); setModal('create') }}>
                <Plus size={18} /> Add Farmer
              </button>
            </section>

            <section className="stat-grid">
              <StatCard label="Total Farmers" value={stats.total} icon={Users} />
              <StatCard label="Active Farmers" value={stats.active} icon={ShieldCheck} />
              <StatCard label="Inactive Farmers" value={stats.inactive} icon={UserRound} />
            </section>

            <section className="panel">
              <div className="panel-toolbar">
                <div>
                  <h3>Farmers</h3>
                  <p>{filtered.length} registered record{filtered.length === 1 ? '' : 's'}</p>
                </div>
                <div className="search">
                  <Search size={17} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search farmers…" />
                </div>
              </div>
              <div className="table-wrap">
                <table>
                    <thead>
                      <tr>
                        <th>RSBSA Number</th>
                        <th>Farmer Name</th>
                        <th>Crops</th>
                        <th>Status</th>
                        <th className="actions-col">Actions</th>
                      </tr>
                    </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="empty"><Spinner /></td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan="5" className="empty"><Users size={34}/><strong>No farmers found</strong><span>Add a farmer or adjust your search.</span></td></tr>
                      ) : filtered.map(farmer => (
                        <tr key={farmer.farmer_id}>
                          <td><span className="rsbsa">{farmer.rsbsa_number}</span></td>
                          <td><button className="link-button" onClick={() => setViewingFarmer(farmer)}><strong>{farmer.name}</strong></button></td>
                          <td>{farmer.crops || '—'}</td>
                          <td><StatusToggle status={farmer.status} onToggle={() => toggleStatus(farmer)} /></td>
                          <td>
                            <div className="row-actions">
                              <button className="icon-button edit" title="Edit farmer" onClick={() => { setSelected(farmer); setModal('edit') }}><Edit3 size={16}/></button>
                              <button className="icon-button delete" title="Delete farmer" onClick={() => setDeleteTarget(farmer)}><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="placeholder panel">
            <div className="placeholder-icon"><Menu size={25}/></div>
            <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
            <p>This component is intentionally hidden for now. Use the Farmers tab to manage registered farmers.</p>
            <button className="secondary" onClick={() => setActiveTab('farmers')}>Go to Farmers</button>
          </section>
        )}
      </main>

      {modal && (
        <FarmerModal
          mode={modal}
          farmer={selected}
          onClose={() => { setModal(null); setSelected(null) }}
          onSave={saveFarmer}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete farmer?"
          message={`This will permanently remove ${deleteTarget.name} from the farmer registry.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteFarmer}
        />
      )}
    </div>
  )
}

function CountUp({ end, duration = 900 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let frame
    let startTime

    const easeOutQuad = t => t * (2 - t)

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(easeOutQuad(progress) * end))
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [end, duration])

  return <strong>{count}</strong>
}

function StatCard({ label, value, icon: Icon }) {
  return <div className="stat-card"><div><span>{label}</span><CountUp end={value} /></div><div className="stat-icon"><Icon size={20}/></div></div>
}

function StatusToggle({ status, onToggle }) {
  return (
    <button
      type="button"
      className={`switch switch-${status}`}
      onClick={onToggle}
      title={`Click to mark as ${status === 'active' ? 'inactive' : 'active'}`}
    >
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
      <span className="switch-label">{status === 'active' ? 'ON' : 'OFF'}</span>
    </button>
  )
}

function PagasaForecast({ forecast }) {
  return (
    <span className="season pagasa-forecast">
      <strong>{forecast.season}</strong>
      <span>{forecast.condition} · {forecast.temp}</span>
      <span className="advisory">{forecast.advisory}</span>
    </span>
  )
}

function FarmerProfile({ farmer, onBack, onEdit, onDelete, onToggle }) {
  return (
    <div className="profile-page">
      <div className="profile-heading">
        <button className="secondary back-button" onClick={onBack}><ArrowRightFromLine size={16}/> Back to Farmers</button>
        <div className="profile-actions">
          <button className="secondary" onClick={onEdit}><Edit3 size={16}/> Edit</button>
          <button className="danger-button small" onClick={onDelete}><Trash2 size={16}/> Delete</button>
        </div>
      </div>

      <section className="profile-hero">
        <div className="profile-avatar"><UserRound size={28}/></div>
        <div>
          <h1>{farmer.name}</h1>
          <div className="profile-meta">
            <span className="rsbsa">{farmer.rsbsa_number}</span>
            <StatusToggle status={farmer.status} onToggle={() => onToggle(farmer)} />
          </div>
        </div>
      </section>

      <section className="profile-grid">
        <div className="profile-card">
          <h3>Contact Information</h3>
          <div className="profile-fields">
            <Field label="Email" wide><span className="field-value">{farmer.email || '—'}</span></Field>
            <Field label="Phone" wide><span className="field-value">{farmer.phone || '—'}</span></Field>
            <Field label="Address" wide><span className="field-value">{farmer.address || '—'}</span></Field>
          </div>
        </div>
        <div className="profile-card">
          <h3>Farm Details</h3>
          <div className="profile-fields">
            <Field label="Crops" wide><span className="field-value">{farmer.crops || '—'}</span></Field>
            <Field label="Status" wide><span className="field-value">{farmer.status || '—'}</span></Field>
            <Field label="Created" wide><span className="field-value">{formatDate(farmer.created_at)}</span></Field>
            <Field label="Last Updated" wide><span className="field-value">{formatDate(farmer.updated_at || farmer.created_at)}</span></Field>
          </div>
        </div>
      </section>
    </div>
  )
}

function FarmerModal({ mode, farmer, onClose, onSave }) {
  const [form, setForm] = useState(farmer ? {
    rsbsa_number: farmer.rsbsa_number || '',
    name: farmer.name || '',
    crops: farmer.crops || '',
    status: farmer.status || 'active',
    address: farmer.address || '',
    email: farmer.email || '',
    phone: farmer.phone || ''
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try { await onSave(form) }
    catch (err) { setError(err.message || 'Unable to save farmer.') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div><span className="eyebrow"><Sprout size={15}/>{mode === 'create' ? 'New Record' : 'Edit Record'}</span><h2>{mode === 'create' ? 'Add Farmer' : 'Update Farmer'}</h2></div>
          <button className="close" onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="RSBSA Number" required><input value={form.rsbsa_number} onChange={e => update('rsbsa_number', e.target.value)} required maxLength={100} placeholder="e.g. RSBSA-07-123456" /></Field>
            <Field label="Farmer Name" required><input value={form.name} onChange={e => update('name', e.target.value)} required maxLength={255} placeholder="Full name" /></Field>
            <Field label="Crops"><input value={form.crops} onChange={e => update('crops', e.target.value)} placeholder="e.g. Rice, Corn, Vegetables" /></Field>
            <Field label="Status" required><select value={form.status} onChange={e => update('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            <Field label="Address" wide><input value={form.address} onChange={e => update('address', e.target.value)} maxLength={255} placeholder="Farm / residential address" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={e => update('email', e.target.value)} maxLength={255} placeholder="farmer@example.com" /></Field>
            <Field label="Phone"><input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} maxLength={20} placeholder="e.g. +63 912 345 6789" /></Field>
          </div>
          {error && <div className="alert error modal-error">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving…' : mode === 'create' ? 'Create Farmer' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, wide, children }) {
  return <label className={wide ? 'field wide' : 'field'}><span>{label}{required && <b>*</b>}</span>{children}</label>
}

function ConfirmModal({ title, message, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false)
  async function confirm() { setBusy(true); await onConfirm(); setBusy(false) }
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal confirm">
        <div className="danger-icon"><Trash2 size={22}/></div>
        <h2>{title}</h2><p>{message}</p>
        <div className="modal-footer"><button className="secondary" onClick={onCancel}>Cancel</button><button className="danger-button" disabled={busy} onClick={confirm}>{busy ? 'Deleting…' : 'Delete Farmer'}</button></div>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default App
