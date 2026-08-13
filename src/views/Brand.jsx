import { Leaf, Sprout } from 'lucide-react'

export function PagasaForecast({ forecast }) {
  return (
    <span className="season pagasa-forecast">
      <strong>{forecast.season}</strong>
      <span>{forecast.condition} · {forecast.temp}</span>
      <span className="advisory">{forecast.advisory}</span>
    </span>
  )
}

export function FarmerEyebrow() {
  return (
    <div className="eyebrow"><Sprout size={16}/> Farmer Registry</div>
  )
}