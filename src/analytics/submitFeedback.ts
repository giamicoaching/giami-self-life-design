import { SUBMIT_SELF_LIFE_DESIGN_FEEDBACK, getSupabaseClient } from '../supabase/client.ts'
import type { FeedbackRow } from './feedback.ts'

const UNIQUE_VIOLATION = '23505'

let inFlightRunId: string | null = null

export function resetFeedbackSubmitLock(): void {
  inFlightRunId = null
}

function isDuplicateError(error: { code?: string; message?: string }): boolean {
  if (error.code === UNIQUE_VIOLATION) return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('duplicate') || message.includes('unique')
}

export type FeedbackSubmitResult = 'ok' | 'duplicate' | 'error' | 'busy'

export async function submitLifeDesignFeedback(row: FeedbackRow): Promise<FeedbackSubmitResult> {
  if (inFlightRunId === row.run_id) return 'busy'
  const client = getSupabaseClient()
  if (!client) return 'error'
  inFlightRunId = row.run_id
  try {
    const { data, error } = await client.rpc(SUBMIT_SELF_LIFE_DESIGN_FEEDBACK, {
      p_run_id: row.run_id,
      p_helpfulness: row.helpfulness,
      p_helpful_stage: row.helpful_stage,
    })
    if (error) {
      if (isDuplicateError(error)) return 'duplicate'
      console.error('[feedback] submit failed')
      return 'error'
    }
    if (data === 'updated') return 'ok'
    if (data === 'already') return 'duplicate'
    console.error('[feedback] submit failed')
    return 'error'
  } catch {
    console.error('[feedback] submit failed')
    return 'error'
  } finally {
    inFlightRunId = null
  }
}
