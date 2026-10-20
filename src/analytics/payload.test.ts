import { describe, expect, it } from 'vitest'
import { createInitialState } from '../domain/initialState.ts'
import { buildUsageStartRow, toUsageGender } from './payload.ts'

describe('toUsageGender', () => {
  it('maps form gender values for anonymous stats', () => {
    expect(toUsageGender('male')).toBe('male')
    expect(toUsageGender('female')).toBe('female')
    expect(toUsageGender('declined')).toBe('not_provided')
  })
})

describe('buildUsageStartRow', () => {
  it('sends only run_id, age_group, and gender', () => {
    const state = createInitialState()
    state.ageInput = '67'
    state.ageYears = 67
    state.gender = 'female'
    const row = buildUsageStartRow(state)
    expect(row).toEqual({
      run_id: state.runId,
      age_group: '65-69',
      gender: 'female',
    })
    expect(Object.keys(row ?? {}).sort()).toEqual(['age_group', 'gender', 'run_id'])
    expect(row).not.toHaveProperty('comment')
    expect(row).not.toHaveProperty('event_name')
    expect(JSON.stringify({ ...row, run_id: undefined })).not.toContain('67')
    expect(JSON.stringify(row)).not.toContain('ageYears')
    expect(JSON.stringify(row)).not.toContain('ageInput')
  })

  it('maps declined answers to not_provided', () => {
    const state = createInitialState()
    state.ageDeclined = true
    state.gender = 'declined'
    const row = buildUsageStartRow(state)
    expect(row?.age_group).toBe('not_provided')
    expect(row?.gender).toBe('not_provided')
    expect(JSON.stringify(row)).not.toContain('declined')
  })
})
