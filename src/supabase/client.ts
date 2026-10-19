import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SELF_LIFE_DESIGN_USAGE_TABLE = 'self_life_design_usage'
export const COMPLETE_SELF_LIFE_DESIGN_USAGE = 'complete_self_life_design_usage'
export const SAVE_SELF_LIFE_DESIGN_USAGE = 'save_self_life_design_usage'
export const SUBMIT_SELF_LIFE_DESIGN_FEEDBACK = 'submit_self_life_design_feedback'

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
