import { clampScore } from '../domain/calculations.ts'
import { createInitialState } from '../domain/initialState.ts'
import type {
  ActionType,
  GenderId,
  HelpResourceId,
  LifeAreaId,
  ProgramState,
  SelfChecks,
  StepId,
  ValueId,
} from '../domain/types.ts'
import { parseExactAge } from '../domain/ageGroup.ts'
import { filterValues, toggleLimited } from '../domain/validation.ts'

export type ProgramAction =
  | {
      type: 'SET_AREA_SCORE'
      areaId: LifeAreaId
      field: 'importance' | 'satisfaction'
      value: number
    }
  | { type: 'SET_PRIORITY_AREA'; areaId: LifeAreaId }
  | { type: 'SET_PRIORITY_REASON'; reason: string }
  | { type: 'SET_CHANGE_IDEAS'; text: string }
  | { type: 'TOGGLE_CANDIDATE_VALUE'; valueId: ValueId }
  | { type: 'TOGGLE_CORE_VALUE'; valueId: ValueId }
  | { type: 'SET_REFINED_CHANGE'; text: string }
  | { type: 'TOGGLE_GOAL_VALUE'; valueId: ValueId }
  | { type: 'SET_GOAL'; text: string }
  | { type: 'SET_GOAL_PERIOD'; text: string }
  | { type: 'SET_GOAL_CRITERIA'; text: string }
  | { type: 'SET_GOAL_FEASIBILITY'; value: number }
  | { type: 'SET_SELF_CHECK'; key: keyof SelfChecks; value: boolean }
  | { type: 'SET_ACTION_TEXT'; index: 0 | 1 | 2; text: string }
  | { type: 'SET_PRIMARY_ACTION'; index: 0 | 1 | 2 }
  | { type: 'SET_ACTION_TYPE'; actionType: ActionType }
  | {
      type: 'SET_ACTION_DETAIL'
      field: 'actionWhat' | 'actionWhen' | 'actionWhere' | 'actionFrequencyOrDuration'
      text: string
    }
  | { type: 'SET_OBSTACLE'; text: string }
  | { type: 'SET_ALTERNATIVE'; text: string }
  | { type: 'TOGGLE_HELP'; resource: HelpResourceId }
  | { type: 'SET_HELP_NOTE'; text: string }
  | { type: 'SET_FIRST_ACTION_FEASIBILITY'; value: number }
  | { type: 'SET_ENCOURAGEMENT'; text: string }
  | { type: 'SET_AGE_INPUT'; text: string }
  | { type: 'SET_AGE_DECLINED'; declined: boolean }
  | { type: 'SET_GENDER'; gender: GenderId }
  | { type: 'MARK_USAGE_STARTED' }
  | { type: 'MARK_USAGE_COMPLETED' }
  | { type: 'MARK_USAGE_SAVED' }
  | { type: 'MARK_FEEDBACK_SUBMITTED' }
  | { type: 'SET_LAST_VISITED'; step: StepId }
  | { type: 'MARK_COMPLETED' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: ProgramState }

export function programReducer(state: ProgramState, action: ProgramAction): ProgramState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state
    case 'RESET':
      return createInitialState()
    case 'SET_LAST_VISITED':
      return { ...state, lastVisitedStep: action.step }
    case 'SET_AGE_INPUT': {
      const ageInput = action.text
      return {
        ...state,
        ageDeclined: false,
        ageInput,
        ageYears: parseExactAge(ageInput),
      }
    }
    case 'SET_AGE_DECLINED':
      return action.declined
        ? { ...state, ageDeclined: true, ageInput: '', ageYears: null }
        : { ...state, ageDeclined: false }
    case 'SET_GENDER':
      return { ...state, gender: action.gender }
    case 'MARK_USAGE_STARTED':
      return { ...state, usageStartedTracked: true }
    case 'MARK_USAGE_COMPLETED':
      return { ...state, usageCompletedTracked: true }
    case 'MARK_USAGE_SAVED':
      return { ...state, usageSavedTracked: true }
    case 'MARK_FEEDBACK_SUBMITTED':
      return { ...state, feedbackSubmitted: true }
    case 'MARK_COMPLETED':
      return { ...state, programCompleted: true }
    case 'SET_AREA_SCORE':
      return {
        ...state,
        areaScores: {
          ...state.areaScores,
          [action.areaId]: {
            ...state.areaScores[action.areaId],
            [action.field]: clampScore(action.value),
          },
        },
      }
    case 'SET_PRIORITY_AREA':
      return { ...state, priorityAreaId: action.areaId }
    case 'SET_PRIORITY_REASON':
      return { ...state, priorityReason: action.reason }
    case 'SET_CHANGE_IDEAS':
      return { ...state, changeIdeas: action.text }
    case 'TOGGLE_CANDIDATE_VALUE': {
      const candidateValueIds = toggleLimited(state.candidateValueIds, action.valueId, 5)
      const coreValueIds = filterValues(state.coreValueIds, candidateValueIds)
      const goalValueIds = filterValues(state.goalValueIds, coreValueIds)
      return { ...state, candidateValueIds, coreValueIds, goalValueIds }
    }
    case 'TOGGLE_CORE_VALUE': {
      if (!state.candidateValueIds.includes(action.valueId)) return state
      const coreValueIds = toggleLimited(state.coreValueIds, action.valueId, 2)
      const goalValueIds = filterValues(state.goalValueIds, coreValueIds)
      return { ...state, coreValueIds, goalValueIds }
    }
    case 'SET_REFINED_CHANGE':
      return { ...state, refinedChange: action.text }
    case 'TOGGLE_GOAL_VALUE': {
      if (!state.coreValueIds.includes(action.valueId)) return state
      return {
        ...state,
        goalValueIds: toggleLimited(state.goalValueIds, action.valueId, 2),
      }
    }
    case 'SET_GOAL':
      return { ...state, goal: action.text }
    case 'SET_GOAL_PERIOD':
      return { ...state, goalPeriod: action.text }
    case 'SET_GOAL_CRITERIA':
      return { ...state, goalCriteria: action.text }
    case 'SET_GOAL_FEASIBILITY':
      return { ...state, goalFeasibility: clampScore(action.value) }
    case 'SET_SELF_CHECK':
      return {
        ...state,
        selfChecks: { ...state.selfChecks, [action.key]: action.value },
      }
    case 'SET_ACTION_TEXT': {
      const actions: ProgramState['actions'] = [...state.actions]
      actions[action.index] = action.text
      const emptied = action.text.trim().length === 0
      const primaryActionIndex =
        emptied && state.primaryActionIndex === action.index ? null : state.primaryActionIndex
      return { ...state, actions, primaryActionIndex }
    }
    case 'SET_PRIMARY_ACTION': {
      if (state.actions[action.index].trim().length === 0) return state
      return {
        ...state,
        primaryActionIndex: action.index,
        actionWhat: state.actions[action.index],
      }
    }
    case 'SET_ACTION_TYPE':
      return {
        ...state,
        actionType: action.actionType,
        actionFrequencyOrDuration:
          state.actionType === action.actionType ? state.actionFrequencyOrDuration : '',
      }
    case 'SET_ACTION_DETAIL':
      return { ...state, [action.field]: action.text }
    case 'SET_OBSTACLE': {
      const obstacle = action.text
      const unknown = /^(없음|모름)[.。!?！？]*$/u.test(obstacle.trim())
      const alternativeAction =
        unknown && state.alternativeAction.trim() === '' ? '해당 없음' : state.alternativeAction
      return { ...state, obstacle, alternativeAction }
    }
    case 'SET_ALTERNATIVE':
      return { ...state, alternativeAction: action.text }
    case 'TOGGLE_HELP': {
      const exists = state.helpResources.includes(action.resource)
      return {
        ...state,
        helpResources: exists
          ? state.helpResources.filter((id) => id !== action.resource)
          : [...state.helpResources, action.resource],
      }
    }
    case 'SET_HELP_NOTE':
      return { ...state, helpNote: action.text }
    case 'SET_FIRST_ACTION_FEASIBILITY':
      return { ...state, firstActionFeasibility: clampScore(action.value) }
    case 'SET_ENCOURAGEMENT':
      return { ...state, selfEncouragement: action.text }
  }
}
