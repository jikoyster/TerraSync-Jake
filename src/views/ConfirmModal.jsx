import { Trash2 } from 'lucide-react'

export default function ConfirmModal({ title, message, onCancel, onConfirm }) {
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