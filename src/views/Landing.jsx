import { Leaf } from 'lucide-react'

export default function Landing() {
  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand login-brand">
          <div className="brand-mark"><Leaf size={24} strokeWidth={2.2} /></div>
          <span>Terra<span>Sync</span></span>
        </div>
        <div className="login-title">
          <h1>TerraSync</h1>
          <p>Agricultural cooperative management platform.</p>
        </div>
        <a href="#/admin/" className="primary full">Go to Dashboard</a>
      </div>
    </div>
  )
}