import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const LIFE_DESIGN_EVENTS_TABLE = 'life_design_events'
export const LIFE_DESIGN_FEEDBACK_TABLE = 'life_design_feedback'

function readConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (typeof url !== 'string' || typeof key !== 'string') return null
  if (!url.trim() || !key.trim()) return null
  return { url: url.trim(), key: key.trim() }
}

let cached: SupabaseClient | null | undefined

export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached
  const config = readConfig()
  if (!config) {
    cached = null
    return null
  }
  cached = createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
  return cached
}

export function resetSupabaseClientCache(): void {
  cached = undefined
}
