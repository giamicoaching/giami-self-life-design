import { describe, expect, it } from 'vitest'
import { createInitialState } from './initialState.ts'
import { programReducer } from '../state/programReducer.ts'
import {
  canSelectActionIndex,
  canVisitStep,
  isInsufficientGoal,
  isNoOrUnknownObstacle,
  isNotApplicableAlternative,
  isStep5Complete,
  stepValidationMessage,
} from './validation.ts'

describe('goal unknown blocking', () => {
  it('blocks empty and unknown-only goals', () => {
    expect(isInsufficientGoal('')).toBe(true)
    expect(isInsufficientGoal('   ')).toBe(true)
    expect(isInsufficientGoal('모르겠음')).toBe(true)
    expect(isInsufficientGoal('모름')).toBe(true)
    expect(isInsufficientGoal('잘 모르겠음')).toBe(true)
    expect(isInsufficientGoal('잘모르겠음')).toBe(true)
    expect(isInsufficientGoal('매주 한 번 글을 쓴다')).toBe(false)
  })
})

describe('obstacle none/unknown', () => {
  it('allows 없음 and 모름, and 해당 없음 as alternative', () => {
    expect(isNoOrUnknownObstacle('없음')).toBe(true)
    expect(isNoOrUnknownObstacle('모름')).toBe(true)
    expect(isNoOrUnknownObstacle('시간 부족')).toBe(false)
    expect(isNotApplicableAlternative('해당 없음')).toBe(true)
  })
})

describe('value and action selection', () => {
  it('keeps candidate values to 5 and core values to 2', () => {
    let state = createInitialState()
    const ids = [
      'autonomy',
      'growth',
      'challenge',
      'creativity',
      'achievement',
      'responsibility',
    ] as const
    for (const valueId of ids) {
      state = programReducer(state, { type: 'TOGGLE_CANDIDATE_VALUE', valueId })
    }
    expect(state.candidateValueIds).toEqual([
      'autonomy',
      'growth',
      'challenge',
      'creativity',
      'achievement',
    ])

    state = programReducer(state, { type: 'TOGGLE_CORE_VALUE', valueId: 'autonomy' })
    state = programReducer(state, { type: 'TOGGLE_CORE_VALUE', valueId: 'growth' })
    state = programReducer(state, { type: 'TOGGLE_CORE_VALUE', valueId: 'challenge' })
    expect(state.coreValueIds).toEqual(['autonomy', 'growth'])

    state = programReducer(state, { type: 'TOGGLE_CANDIDATE_VALUE', valueId: 'autonomy' })
    expect(state.coreValueIds).toEqual(['growth'])
  })

  it('does not select an empty action as the primary action', () => {
    let state = createInitialState()
    state = programReducer(state, { type: 'SET_ACTION_TEXT', index: 0, text: '도서관에서 공부한다' })
    state = programReducer(state, { type: 'SET_PRIMARY_ACTION', index: 1 })
    expect(state.primaryActionIndex).toBeNull()
    expect(canSelectActionIndex(state, 1)).toBe(false)
    state = programReducer(state, { type: 'SET_PRIMARY_ACTION', index: 0 })
    expect(state.primaryActionIndex).toBe(0)
  })

  it('clears frequency or duration when the action type changes', () => {
    let state = createInitialState()
    state = programReducer(state, { type: 'SET_ACTION_TYPE', actionType: 'repeat' })
    state = programReducer(state, {
      type: 'SET_ACTION_DETAIL',
      field: 'actionFrequencyOrDuration',
      text: '주 3회',
    })
    state = programReducer(state, { type: 'SET_ACTION_TYPE', actionType: 'once' })
    expect(state.actionType).toBe('once')
    expect(state.actionFrequencyOrDuration).toBe('')
  })
})

describe('step 5 obstacle handling', () => {
  it('allows 없음 with 해당 없음', () => {
    let state = createInitialState()
    state = programReducer(state, { type: 'SET_ACTION_TEXT', index: 0, text: '글을 쓴다' })
    state = programReducer(state, { type: 'SET_PRIMARY_ACTION', index: 0 })
    state = programReducer(state, { type: 'SET_ACTION_TYPE', actionType: 'once' })
    state = programReducer(state, { type: 'SET_ACTION_DETAIL', field: 'actionWhat', text: '글을 쓴다' })
    state = programReducer(state, { type: 'SET_ACTION_DETAIL', field: 'actionWhen', text: '토요일' })
    state = programReducer(state, { type: 'SET_ACTION_DETAIL', field: 'actionWhere', text: '집' })
    state = programReducer(state, { type: 'SET_OBSTACLE', text: '없음' })
    state = programReducer(state, { type: 'SET_FIRST_ACTION_FEASIBILITY', value: 5 })
    expect(state.alternativeAction).toBe('해당 없음')
    expect(isStep5Complete(state)).toBe(true)
  })

  it('requires an alternative when the obstacle is real', () => {
    let state = createInitialState()
    state = programReducer(state, { type: 'SET_ACTION_TEXT', index: 0, text: '글을 쓴다' })
    state = programReducer(state, { type: 'SET_PRIMARY_ACTION', index: 0 })
    state = programReducer(state, { type: 'SET_ACTION_TYPE', actionType: 'once' })
    state = programReducer(state, { type: 'SET_ACTION_DETAIL', field: 'actionWhat', text: '글을 쓴다' })
    state = programReducer(state, { type: 'SET_ACTION_DETAIL', field: 'actionWhen', text: '토요일' })
    state = programReducer(state, { type: 'SET_ACTION_DETAIL', field: 'actionWhere', text: '집' })
    state = programReducer(state, { type: 'SET_OBSTACLE', text: '시간 부족' })
    state = programReducer(state, { type: 'SET_FIRST_ACTION_FEASIBILITY', value: 5 })
    expect(stepValidationMessage(state, 'step5')).toContain('대안행동')
    expect(isStep5Complete(state)).toBe(false)
  })
})

describe('navigation gating', () => {
  it('does not allow visiting later steps before earlier ones are complete', () => {
    const state = createInitialState()
    expect(canVisitStep(state, 'step1-1')).toBe(true)
    expect(canVisitStep(state, 'step2')).toBe(false)
    expect(canVisitStep(state, 'summary')).toBe(false)
  })
})
