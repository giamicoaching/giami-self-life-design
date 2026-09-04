import { analyticsAgeGroup, type AgeGroup } from '../domain/ageGroup.ts'
import { hasCompleteDemographics } from '../domain/demographics.ts'
import type { GenderId, ProgramState } from '../domain/types.ts'

export const USAGE_EVENTS = {
  started: 'life_design_started',
  completed: 'life_design_completed',
  saved: 'result_saved',
} as const

export type UsageEventName = (typeof USAGE_EVENTS)[keyof typeof USAGE_EVENTS]

export type UsageGender = 'male' | 'female' | 'not_provided'

export interface UsageEventRow {
  run_id: string
  event_name: UsageEventName
  age_group: AgeGroup
  gender: UsageGender
}

export function toUsageGender(gender: GenderId): UsageGender {
  if (gender === 'declined') return 'not_provided'
  return gender
}

export function buildUsageEvent(
  state: ProgramState,
  eventName: UsageEventName,
): UsageEventRow | null {
  if (!state.runId) return null
  if (!hasCompleteDemographics(state) || state.gender === null) return null
  const age_group = analyticsAgeGroup(state.ageYears, state.ageDeclined)
  if (!age_group) return null
  return {
    run_id: state.runId,
    event_name: eventName,
    age_group,
    gender: toUsageGender(state.gender),
  }
}
