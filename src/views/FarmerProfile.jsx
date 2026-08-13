import { ArrowRightFromLine, Edit3, Trash2, UserRound } from 'lucide-react'
import StatusToggle from './StatusToggle'

export default function FarmerProfile({ farmer, onBack, onEdit, onDelete, onToggle }) {
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
            <Field label="Status" wide><span className="status-dot">{farmer.status === 'active' ? '🟢 Active' : '🔴 Inactive'}</span></Field>
            <Field label="Created" wide><span className="field-value">{formatDate(farmer.created_at)}</span></Field>
            <Field label="Last Updated" wide><span className="field-value">{formatDate(farmer.updated_at || farmer.created_at)}</span></Field>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, wide, children }) {
  return <label className={wide ? 'field wide' : 'field'}><span>{label}</span>{children}</label>
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}