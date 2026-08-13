import { useEffect, useState } from 'react'

export default function StatCard({ label, value, icon: Icon }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let frame
    let startTime
    const duration = 900
    const easeOutQuad = t => t * (2 - t)
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(easeOutQuad(progress) * value))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <div className="stat-card"><div><span>{label}</span><strong>{count}</strong></div><div className="stat-icon"><Icon size={20}/></div></div>
}