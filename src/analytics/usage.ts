import {
  COMPLETE_SELF_LIFE_DESIGN_USAGE,
  SAVE_SELF_LIFE_DESIGN_USAGE,
  SELF_LIFE_DESIGN_USAGE_TABLE,
  getSupabaseClient,
} from '../supabase/client.ts'
import type { ProgramState } from '../domain/types.ts'
import { buildUsageStartRow, trackableRunId, type UsageStartRow } from './payload.ts'

const UNIQUE_VIOLATION = '23505'

let startedLock = false
let completedLock = false
let savedLock = false

export function resetUsageEventLocks(): void {
  startedLock = false
  completedLock = false
  savedLock = false
}

function isDuplicateEventError(error: { code?: string; message?: string }): boolean {
  if (error.code === UNIQUE_VIOLATION) return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('duplicate') || message.includes('unique')
}

async function insertUsageStart(row: UsageStartRow): Promise<void> {
  const client = getSupabaseClient()
  if (!client) return
  try {
    const { error } = await client.from(SELF_LIFE_DESIGN_USAGE_TABLE).insert(row)
    if (!error || isDuplicateEventError(error)) return
    console.error('[usage] start insert failed')
  } catch {
    console.error('[usage] start insert failed')
  }
}

async function markUsageColumn(functionName: string, runId: string): Promise<void> {
  const client = getSupabaseClient()
  if (!client) return
  try {
    const { data, error } = await client.rpc(functionName, { p_run_id: runId })
    if (error) {
      if (isDuplicateEventError(error)) return
      console.error('[usage] update failed')
      return
    }
    if (data === 'updated' || data === 'already') return
    console.error('[usage] update failed')
  } catch {
    console.error('[usage] update failed')
  }
}

export function trackLifeDesignStarted(state: ProgramState, markTracked: () => void): void {
  if (state.usageStartedTracked || startedLock) return
  const row = buildUsageStartRow(state)
  if (!row) return
  startedLock = true
  markTracked()
  void insertUsageStart(row)
}

export function trackLifeDesignCompleted(state: ProgramState, markTracked: () => void): void {
  if (state.usageCompletedTracked || completedLock) return
  const runId = trackableRunId(state)
  if (!runId) return
  completedLock = true
  markTracked()
  void markUsageColumn(COMPLETE_SELF_LIFE_DESIGN_USAGE, runId)
}

export function trackResultSaved(state: ProgramState, markTracked: () => void): void {
  if (state.usageSavedTracked || savedLock) return
  const runId = trackableRunId(state)
  if (!runId) return
  savedLock = true
  markTracked()
  void markUsageColumn(SAVE_SELF_LIFE_DESIGN_USAGE, runId)
}
