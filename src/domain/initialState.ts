import { LIFE_AREA_IDS } from './types.ts'
import type { AreaScore, LifeAreaId, ProgramState } from './types.ts'

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

export function hasSavedProgress(state: ProgramState): boolean {
  return (
    state.completedStepIds.length > 0 ||
    state.lastVisitedStep !== 'home' ||
    Object.values(state.areaScores).some(
      (score) => score.importance !== null || score.satisfaction !== null,
    ) ||
    state.priorityAreaId !== null ||
    state.priorityReason.trim() !== '' ||
    state.changeIdeas.trim() !== '' ||
    state.candidateValueIds.length > 0 ||
    state.goal.trim() !== '' ||
    state.actions.some((action) => action.trim() !== '')
  )
}
