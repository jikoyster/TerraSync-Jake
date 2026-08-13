export default function StatusToggle({ status, onToggle }) {
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