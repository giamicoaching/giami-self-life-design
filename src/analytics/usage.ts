import { LIFE_DESIGN_EVENTS_TABLE, getSupabaseClient } from '../supabase/client.ts'
import type { ProgramState } from '../domain/types.ts'
import { USAGE_EVENTS, buildUsageEvent, type UsageEventRow } from './payload.ts'

export { USAGE_EVENTS }
export type { UsageEventRow }

const UNIQUE_VIOLATION = '23505'

let startedLock = false
let completedLock = false
let savedLock = false

export function resetUsageEventLocks(): void {
  startedLock = false
  completedLock = false
  savedLock = false
}

function warnDev(message: string): void {
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    console.warn(message)
  }
}

function isDuplicateEventError(error: { code?: string; message?: string }): boolean {
  if (error.code === UNIQUE_VIOLATION) return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('duplicate') || message.includes('unique')
}

async function persistUsageEvent(row: UsageEventRow): Promise<void> {
  const client = getSupabaseClient()
  if (!client) return
  try {
    const { error } = await client.from(LIFE_DESIGN_EVENTS_TABLE).insert(row)
    if (!error) return
    if (isDuplicateEventError(error)) return
    warnDev('[usage] event insert failed')
  } catch {
    warnDev('[usage] event insert failed')
  }
}

export function trackLifeDesignStarted(state: ProgramState, markTracked: () => void): void {
  if (state.usageStartedTracked || startedLock) return
  const row = buildUsageEvent(state, USAGE_EVENTS.started)
  if (!row) return
  startedLock = true
  markTracked()
  void persistUsageEvent(row)
}

export function trackLifeDesignCompleted(state: ProgramState, markTracked: () => void): void {
  if (state.usageCompletedTracked || completedLock) return
  const row = buildUsageEvent(state, USAGE_EVENTS.completed)
  if (!row) return
  completedLock = true
  markTracked()
  void persistUsageEvent(row)
}

export function trackResultSaved(state: ProgramState, markTracked: () => void): void {
  if (state.usageSavedTracked || savedLock) return
  const row = buildUsageEvent(state, USAGE_EVENTS.saved)
  if (!row) return
  savedLock = true
  markTracked()
  void persistUsageEvent(row)
}
