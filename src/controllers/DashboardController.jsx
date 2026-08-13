import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../views/DashboardLayout.jsx'
import FarmerList from '../views/FarmerList.jsx'
import FarmerProfile from '../views/FarmerProfile.jsx'
import FarmerModal from '../views/FarmerModal.jsx'
import ConfirmModal from '../views/ConfirmModal.jsx'
import { getFarmers, searchFarmers, computeStats } from '../models/farmer'
import { Check, X } from 'lucide-react'

const EMPTY_FORM = {
  rsbsa_number: '',
  name: '',
  crops: '',
  status: 'active',
  address: '',
  email: '',
  phone: ''
}

export default function DashboardController({ session }) {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewingFarmer, setViewingFarmer] = useState(null)
  const [forecast, setForecast] = useState({
    season: 'Habagat Season',
    condition: 'Partly Cloudy',
    temp: '25–32°C',
    advisory: 'Afternoon showers likely. Bring rain gear.'
  })
  const [now, setNow] = useState(new Date())

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

  async function loadFarmers() {
    setLoading(true)
    try {
      const data = await getFarmers()
      setFarmers(data)
    } catch (err) {
      showNotice(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function showNotice(text, type = 'success') {
    setNotice({ text, type })
    window.clearTimeout(window.__terraNotice)
    window.__terraNotice = window.setTimeout(() => setNotice(null), 4500)
  }

  async function toggleStatus(farmer) {
    const next = farmer.status === 'active' ? 'inactive' : 'active'
    try {
      const { error } = await supabase
        .from('farmers')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('farmer_id', farmer.farmer_id)
      if (error) throw error
      showNotice(`Farmer marked as ${next}.`)
      setFarmers(prev => prev.map(f => f.farmer_id === farmer.farmer_id ? { ...f, status: next, updated_at: new Date().toISOString() } : f))
      setViewingFarmer(prev => prev && prev.farmer_id === farmer.farmer_id ? { ...prev, status: next, updated_at: new Date().toISOString() } : prev)
    } catch (err) {
      showNotice(err.message, 'error')
    }
  }

  async function saveFarmer(values) {
    if (modal === 'create') {
      const created = await createFarmer(values)
      showNotice('Farmer created successfully.')
    } else {
      await updateFarmer(selected.farmer_id, values)
      showNotice('Farmer updated successfully.')
    }
    setModal(null); setSelected(null)
    await loadFarmers()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteFarmer(deleteTarget.farmer_id)
      showNotice('Farmer deleted.')
      await loadFarmers()
    } catch (err) {
      showNotice(err.message, 'error')
    }
    setDeleteTarget(null)
  }

  const filtered = searchFarmers(farmers, query)

  const email = session.user?.email || 'Manager'
  const displayName = email.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <DashboardLayout displayName={displayName} forecast={forecast}>
      {notice && <div className={`toast ${notice.type}`}>{notice.type === 'success' ? <Check size={17}/> : <X size={17}/>} {notice.text}</div>}

      {viewingFarmer ? (
        <FarmerProfile
          farmer={viewingFarmer}
          onBack={() => {
            const url = new URL(window.location);
            url.searchParams.delete('rsbsa');
            window.history.pushState({}, '', url);
            setViewingFarmer(null);
          }}
          onEdit={() => { setSelected(viewingFarmer); setModal('edit'); setViewingFarmer(null) }}
          onDelete={() => { setDeleteTarget(viewingFarmer); setViewingFarmer(null) }}
          onToggle={toggleStatus}
        />
      ) : (
        <FarmerList
          farmers={filtered}
          loading={loading}
          query={query}
          onQueryChange={setQuery}
          onViewFarmer={(farmer) => {
            const url = new URL(window.location);
            url.searchParams.set('rsbsa', farmer.rsbsa_number);
            window.history.pushState({}, '', url);
            setViewingFarmer(farmer);
          }}
          onEditFarmer={(farmer) => { setSelected(farmer); setModal('edit') }}
          onDeleteFarmer={(farmer) => setDeleteTarget(farmer)}
          onToggleStatus={toggleStatus}
          onAddFarmer={() => { setSelected(null); setModal('create') }}
        />
      )}

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
          onConfirm={confirmDelete}
        />
      )}
    </DashboardLayout>
  )
}