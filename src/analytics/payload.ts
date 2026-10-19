import { analyticsAgeGroup, type AgeGroup } from '../domain/ageGroup.ts'
import { hasCompleteDemographics } from '../domain/demographics.ts'
import type { GenderId, ProgramState } from '../domain/types.ts'

export type UsageGender = 'male' | 'female' | 'not_provided'

export interface UsageStartRow {
  run_id: string
  age_group: AgeGroup
  gender: UsageGender
}

export function toUsageGender(gender: GenderId): UsageGender {
  if (gender === 'declined') return 'not_provided'
  return gender
}

export function buildUsageStartRow(state: ProgramState): UsageStartRow | null {
  if (!state.runId) return null
  if (!hasCompleteDemographics(state) || state.gender === null) return null
  const age_group = analyticsAgeGroup(state.ageYears, state.ageDeclined)
  if (!age_group) return null
  return {
    run_id: state.runId,
    age_group,
    gender: toUsageGender(state.gender),
  }
}

export function trackableRunId(state: ProgramState): string | null {
  return buildUsageStartRow(state)?.run_id ?? null
}
