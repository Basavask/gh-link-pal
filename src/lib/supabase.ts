import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xoerqhyhwqzlinjaxrvs.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZXJxaHlod3F6bGluamF4cnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Nzg1NTMsImV4cCI6MjA2OTQ1NDU1M30.QnZLRQAfcENkjP606UIvI13VplrZBXvkdY7ScySNSJo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
