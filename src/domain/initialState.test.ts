import { describe, expect, it } from 'vitest'
import { createInitialState, hasMeaningfulProgress } from './initialState.ts'

describe('hasMeaningfulProgress', () => {
  it('treats a fresh initial state as no progress', () => {
    expect(hasMeaningfulProgress(createInitialState())).toBe(false)
  })

  it('treats complete basic info as progress', () => {
    const declined = createInitialState()
    declined.ageDeclined = true
    declined.gender = 'declined'
    expect(hasMeaningfulProgress(declined)).toBe(true)

    const aged = createInitialState()
    aged.ageInput = '67'
    aged.ageYears = 67
    aged.gender = 'female'
    expect(hasMeaningfulProgress(aged)).toBe(true)
  })

  it('treats a single life-area answer as progress', () => {
    const state = createInitialState()
    state.areaScores.health.importance = 5
    expect(hasMeaningfulProgress(state)).toBe(true)
  })

  it('treats moving past home as progress', () => {
    const state = createInitialState()
    state.lastVisitedStep = 'step1-1'
    expect(hasMeaningfulProgress(state)).toBe(true)
  })
})
