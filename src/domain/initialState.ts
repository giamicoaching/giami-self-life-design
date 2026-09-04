import { LIFE_AREA_IDS } from './types.ts'
import type { AreaScore, LifeAreaId, ProgramState } from './types.ts'
import { hasCompleteDemographics } from './demographics.ts'
import { createRunId } from './runId.ts'

function emptyScore(): AreaScore {
  return { importance: null, satisfaction: null }
}

function emptyAreaScores(): Record<LifeAreaId, AreaScore> {
  return Object.fromEntries(LIFE_AREA_IDS.map((id) => [id, emptyScore()])) as Record<
    LifeAreaId,
    AreaScore
  >
}

export function createInitialState(): ProgramState {
  return {
    version: 1,
    lastVisitedStep: 'home',
    completedStepIds: [],
    programCompleted: false,
    updatedAt: new Date().toISOString(),
    ageInput: '',
    ageYears: null,
    ageDeclined: false,
    gender: null,
    runId: createRunId(),
    usageStartedTracked: false,
    usageCompletedTracked: false,
    usageSavedTracked: false,
    areaScores: emptyAreaScores(),
    priorityAreaId: null,
    priorityReason: '',
    changeIdeas: '',
    candidateValueIds: [],
    coreValueIds: [],
    refinedChange: '',
    goalValueIds: [],
    goal: '',
    goalPeriod: '',
    goalCriteria: '',
    goalFeasibility: null,
    selfChecks: {
      trulyWanted: null,
      areaValueReflected: null,
      specific: null,
      feasibleInPeriod: null,
    },
    actions: ['', '', ''],
    primaryActionIndex: null,
    actionType: null,
    actionWhat: '',
    actionWhen: '',
    actionWhere: '',
    actionFrequencyOrDuration: '',
    obstacle: '',
    alternativeAction: '',
    helpResources: [],
    helpNote: '',
    firstActionFeasibility: null,
    selfEncouragement: '',
  }
}

export function hasMeaningfulProgress(state: ProgramState): boolean {
  if (hasCompleteDemographics(state)) return true
  if (
    Object.values(state.areaScores).some(
      (score) => score.importance !== null || score.satisfaction !== null,
    )
  ) {
    return true
  }
  if (state.priorityAreaId !== null || state.priorityReason.trim() !== '') return true
  if (state.changeIdeas.trim() !== '') return true
  if (state.candidateValueIds.length > 0 || state.coreValueIds.length > 0) return true
  if (state.refinedChange.trim() !== '') return true
  if (state.goalValueIds.length > 0 || state.goal.trim() !== '') return true
  if (state.goalPeriod.trim() !== '' || state.goalCriteria.trim() !== '') return true
  if (state.goalFeasibility !== null) return true
  if (Object.values(state.selfChecks).some((value) => value !== null)) return true
  if (state.actions.some((action) => action.trim() !== '')) return true
  if (state.primaryActionIndex !== null || state.actionType !== null) return true
  if (
    state.actionWhat.trim() !== '' ||
    state.actionWhen.trim() !== '' ||
    state.actionWhere.trim() !== '' ||
    state.actionFrequencyOrDuration.trim() !== ''
  ) {
    return true
  }
  if (state.obstacle.trim() !== '' || state.alternativeAction.trim() !== '') return true
  if (state.helpResources.length > 0 || state.helpNote.trim() !== '') return true
  if (state.firstActionFeasibility !== null || state.selfEncouragement.trim() !== '') return true
  if (state.completedStepIds.length > 0 || state.programCompleted) return true
  return state.lastVisitedStep !== 'home'
}
