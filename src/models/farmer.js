import { supabase } from '../supabase'

// Model: Farmer data operations
// This model handles all database operations related to farmers

export async function getFarmers() {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .order('farmer_id', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getFarmerById(id) {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('farmer_id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createFarmer(values) {
  const { data, error } = await supabase
    .from('farmers')
    .insert([values])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFarmer(id, values) {
  const { data, error } = await supabase
    .from('farmers')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('farmer_id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFarmer(id) {
  const { error } = await supabase
    .from('farmers')
    .delete()
    .eq('farmer_id', id)
  if (error) throw error
}

export function searchFarmers(farmers, query) {
  const q = query.trim().toLowerCase()
  if (!q) return farmers
  return farmers.filter(f =>
    [f.rsbsa_number, f.name, f.crops, f.status, f.address, f.email]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q))
  )
}

export function computeStats(farmers) {
  return {
    total: farmers.length,
    active: farmers.filter(f => f.status === 'active').length,
    inactive: farmers.filter(f => f.status === 'inactive').length
  }
}