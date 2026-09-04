import { track } from '@vercel/analytics'
import { analyticsAgeGroup, type AgeGroup } from '../domain/ageGroup.ts'
import { hasCompleteDemographics } from '../domain/demographics.ts'
import type { GenderId, ProgramState } from '../domain/types.ts'

export const USAGE_EVENTS = {
  started: 'life_design_started',
  completed: 'life_design_completed',
  saved: 'result_saved',
} as const

export type ResultSaveScreen = 'step1-result' | 'summary'

let startedLock = false
let completedLock = false

export function resetUsageEventLocks(): void {
  startedLock = false
  completedLock = false
}

function safeTrack(name: string, properties: Record<string, string>): void {
  try {
    track(name, properties)
  } catch {
    // 개발 환경이나 스크립트 미주입 시에도 앱이 멈추지 않게 한다.
  }
}

function usageDemographics(
  state: ProgramState,
): { age_group: AgeGroup; gender: GenderId } | null {
  if (!hasCompleteDemographics(state) || state.gender === null) return null
  const age_group = analyticsAgeGroup(state.ageYears, state.ageDeclined)
  if (!age_group) return null
  return { age_group, gender: state.gender }
}

export function trackLifeDesignStarted(
  state: ProgramState,
  markTracked: () => void,
): void {
  if (state.usageStartedTracked || startedLock) return
  const properties = usageDemographics(state)
  if (!properties) return
  startedLock = true
  safeTrack(USAGE_EVENTS.started, properties)
  markTracked()
}

export function trackLifeDesignCompleted(
  state: ProgramState,
  markTracked: () => void,
): void {
  if (state.usageCompletedTracked || completedLock) return
  const properties = usageDemographics(state)
  if (!properties) return
  completedLock = true
  safeTrack(USAGE_EVENTS.completed, properties)
  markTracked()
}

export function trackResultSaved(screen: ResultSaveScreen): void {
  safeTrack(USAGE_EVENTS.saved, { screen })
}
