import { Search, Plus, Users, Edit3, Trash2 } from 'lucide-react'
import StatusToggle from './StatusToggle'
import StatCard from './StatCard'
import Spinner from './Spinner'

export default function FarmerList({
  farmers,
  loading,
  query,
  onQueryChange,
  onViewFarmer,
  onEditFarmer,
  onDeleteFarmer,
  onToggleStatus,
  onAddFarmer
}) {
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow"><Sprout size={16}/> Farmer Registry</div>
          <h1>Registered Farmers</h1>
          <p>View and manage the farmers registered with your cooperative.</p>
        </div>
        <button className="primary" onClick={onAddFarmer}>
          <Plus size={18} /> Add Farmer
        </button>
      </section>

      <section className="stat-grid">
        <StatCard label="Total Farmers" value={farmers.length} icon={Users} />
        <StatCard label="Active Farmers" value={farmers.filter(f => f.status === 'active').length} icon={ShieldCheck} />
        <StatCard label="Inactive Farmers" value={farmers.filter(f => f.status === 'inactive').length} icon={UserRound} />
      </section>

      <section className="panel">
        <div className="panel-toolbar">
          <div>
            <h3>Farmers</h3>
            <p>{farmers.length} registered record{farmers.length === 1 ? '' : 's'}</p>
          </div>
          <div className="search">
            <Search size={17} />
            <input value={query} onChange={e => onQueryChange(e.target.value)} placeholder="Search farmers…" />
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
              ) : farmers.length === 0 ? (
                <tr><td colSpan="5" className="empty"><Users size={34}/><strong>No farmers found</strong><span>Add a farmer or adjust your search.</span></td></tr>
              ) : farmers.map(farmer => (
                <tr key={farmer.farmer_id}>
                  <td><span className="rsbsa">{farmer.rsbsa_number}</span></td>
                  <td><button className="link-button" onClick={() => {
                    const url = new URL(window.location);
                    url.searchParams.set('rsbsa', farmer.rsbsa_number);
                    window.history.pushState({}, '', url);
                    onViewFarmer(farmer);
                  }}><strong>{farmer.name}</strong></button></td>
                  <td>{farmer.crops || '—'}</td>
                  <td><StatusToggle status={farmer.status} onToggle={() => onToggleStatus(farmer)} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button edit" title="Edit farmer" onClick={() => onEditFarmer(farmer)}><Edit3 size={16}/></button>
                      <button className="icon-button delete" title="Delete farmer" onClick={() => onDeleteFarmer(farmer)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}