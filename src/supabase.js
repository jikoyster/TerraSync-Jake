import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://lihrhlgagnqqwhpfenou.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaHJobGdhZ25xcXdocGZlbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzE0MzIsImV4cCI6MjA4OTgwNzQzMn0.gM6ZKqAxH7kz5ZeiRXOCD8wSoR48MR9HLVCOfTKt9W0'

// The anon/publishable key is intended for browser use.
// Protect your tables with Supabase Row Level Security policies.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
