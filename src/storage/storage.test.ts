import { describe, expect, it } from 'vitest'
import { createInitialState } from '../domain/initialState.ts'
import { LIFE_AREA_IDS } from '../domain/types.ts'
import {
  clearProgramState,
  loadProgramState,
  mergeGuestIntoAccount,
  parseProgramState,
  saveProgramState,
  STORAGE_KEY,
} from './storage.ts'
import { createMemoryStorage } from './memoryStorage.ts'

function filledState() {
  const state = createInitialState()
  for (const id of LIFE_AREA_IDS) {
    state.areaScores[id] = { importance: 6, satisfaction: 3 }
  }
  state.priorityAreaId = 'health'
  state.priorityReason = '건강이 다른 영역의 기반이라고 생각한다.'
  state.ageInput = '67'
  state.ageYears = 67
  state.gender = 'female'
  state.lastVisitedStep = 'step2'
  return state
}

describe('program storage', () => {
  it('saves and restores answers after a simulated reload', () => {
    const memory = createMemoryStorage()
    const state = filledState()
    saveProgramState(state, memory)
    const loaded = loadProgramState(memory)
    expect(loaded?.priorityAreaId).toBe('health')
    expect(loaded?.priorityReason).toContain('건강')
    expect(loaded?.areaScores.health.importance).toBe(6)
    expect(loaded?.areaScores.health.satisfaction).toBe(3)
    expect(loaded?.lastVisitedStep).toBe('step2')
    expect(loaded?.ageYears).toBe(67)
    expect(loaded?.gender).toBe('female')
    expect(loaded?.runId).toBe(state.runId)
    expect(loaded?.usageSavedTracked).toBe(false)
    expect(loaded?.completedStepIds).toContain('step1-result')
    expect(loaded?.completedStepIds).toContain('step2')
  })

  it('survives JSON snapshot round-trip used on browser reopen', () => {
    const saved = JSON.parse(JSON.stringify(filledState())) as unknown
    const restored = parseProgramState(saved)
    expect(restored?.priorityAreaId).toBe('health')
    expect(restored?.areaScores.selfGrowth.importance).toBe(6)
  })

  it('clears stored data on reset', () => {
    const memory = createMemoryStorage()
    saveProgramState(filledState(), memory)
    expect(memory.getItem(STORAGE_KEY)).toBeTruthy()
    clearProgramState(memory)
    expect(loadProgramState(memory)).toBeNull()
  })

  it('rejects a different storage version instead of corrupting data', () => {
    expect(parseProgramState({ version: 2, goal: 'x' })).toBeNull()
  })

  it('restores older snapshots that have no runId or saved-tracking flag', () => {
    const snapshot = JSON.parse(JSON.stringify(filledState())) as Record<string, unknown>
    delete snapshot.runId
    delete snapshot.usageSavedTracked
    delete snapshot.usageStartedTracked
    const restored = parseProgramState(snapshot)
    expect(restored?.priorityAreaId).toBe('health')
    expect(restored?.priorityReason).toContain('건강')
    expect(restored?.ageYears).toBe(67)
    expect(restored?.gender).toBe('female')
    expect(restored?.runId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(restored?.usageSavedTracked).toBe(false)
    expect(restored?.usageStartedTracked).toBe(false)
  })

  it('keeps the newer guest or remote copy when merging for login', () => {
    const guest = filledState()
    guest.updatedAt = '2026-09-01T10:00:00.000Z'
    const remote = filledState()
    remote.priorityReason = '예전 이유'
    remote.updatedAt = '2026-08-01T10:00:00.000Z'
    const merged = mergeGuestIntoAccount(guest, remote)
    expect(merged.priorityReason).toContain('건강')
  })
})
