import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const supabaseRdUrl = process.env.REACT_APP_SUPABASE_URL_RD
const supabaseRdAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY_RD

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set — usando dados mockados.')
}
if (!supabaseRdUrl || !supabaseRdAnonKey) {
  console.warn('Supabase RD Station env vars not set — pipeline usará dados mockados.')
} else {
  console.log('[dash:rd] conectado a', supabaseRdUrl)
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export const supabaseRD = createClient(
  supabaseRdUrl || 'https://placeholder.supabase.co',
  supabaseRdAnonKey || 'placeholder'
)
