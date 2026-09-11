import { LIFE_DESIGN_FEEDBACK_TABLE, getSupabaseClient } from '../supabase/client.ts'
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
    const { error } = await client.from(LIFE_DESIGN_FEEDBACK_TABLE).insert(row)
    if (!error) return 'ok'
    if (isDuplicateError(error)) return 'duplicate'
    return 'error'
  } catch {
    return 'error'
  } finally {
    inFlightRunId = null
  }
}
