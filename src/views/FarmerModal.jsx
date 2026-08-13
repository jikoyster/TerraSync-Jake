import { useState } from 'react'
import { X, Sprout } from 'lucide-react'
import Field from './Field'

export default function FarmerModal({ mode, farmer, onClose, onSave }) {
  const [form, setForm] = useState(farmer ? {
    rsbsa_number: farmer.rsbsa_number || '',
    name: farmer.name || '',
    crops: farmer.crops || '',
    status: farmer.status || 'active',
    address: farmer.address || '',
    email: farmer.email || '',
    phone: farmer.phone || ''
  } : {
    rsbsa_number: '',
    name: '',
    crops: '',
    status: 'active',
    address: '',
    email: '',
    phone: ''
  })
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