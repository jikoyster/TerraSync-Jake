import { useState } from 'react'
import { supabase } from '../supabase'
import Login from '../views/Login'

export default function LoginController({ onLogin }) {
  return <Login onLogin={onLogin} />
}