import { describe, expect, it } from 'vitest'
import { DEMOGRAPHICS_PATH } from './demographics.ts'
import { createInitialState } from './initialState.ts'
import { resumePath } from './navigation.ts'

describe('resumePath', () => {
  it('sends new or incomplete demographics to the basic-info screen', () => {
    expect(resumePath(createInitialState())).toBe(DEMOGRAPHICS_PATH)
  })

  it('opens step 1 after demographics are complete and no later step is saved', () => {
    const state = createInitialState()
    state.ageInput = '67'
    state.ageYears = 67
    state.gender = 'female'
    expect(resumePath(state)).toBe('/step/1/1')
  })
})
