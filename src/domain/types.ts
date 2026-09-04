export const LIFE_AREA_IDS = [
  'selfGrowth',
  'workCareer',
  'leisure',
  'family',
  'health',
  'lovePartner',
  'friendsSocial',
  'community',
  'finance',
] as const

export type LifeAreaId = (typeof LIFE_AREA_IDS)[number]

export const VALUE_IDS = [
  'autonomy',
  'growth',
  'challenge',
  'creativity',
  'achievement',
  'responsibility',
  'authenticity',
  'stability',
  'balance',
  'pleasure',
  'innerPeace',
  'respect',
  'care',
  'intimacy',
  'cooperation',
  'fairness',
  'contribution',
  'meaning',
] as const

export type ValueId = (typeof VALUE_IDS)[number]

export const HELP_RESOURCE_IDS = ['people', 'information', 'materials', 'tools'] as const

export type HelpResourceId = (typeof HELP_RESOURCE_IDS)[number]

export const ACTION_TYPES = ['once', 'repeat'] as const

export type ActionType = (typeof ACTION_TYPES)[number]

export const STEP_IDS = [
  'home',
  'step1-1',
  'step1-2',
  'step1-3',
  'step1-result',
  'step2',
  'step3-change',
  'step3-candidates',
  'step3-core',
  'step3-refine',
  'step4',
  'step5',
  'summary',
] as const

export type StepId = (typeof STEP_IDS)[number]

export const MAIN_STAGE_IDS = [
  'evaluate',
  'priority',
  'change',
  'goal',
  'action',
  'summary',
] as const

export type MainStageId = (typeof MAIN_STAGE_IDS)[number]

export const GENDER_IDS = ['male', 'female', 'declined'] as const

export type GenderId = (typeof GENDER_IDS)[number]

export interface AreaScore {
  importance: number | null
  satisfaction: number | null
}

export interface SelfChecks {
  trulyWanted: boolean | null
  areaValueReflected: boolean | null
  specific: boolean | null
  feasibleInPeriod: boolean | null
}

export interface ProgramState {
  version: 1
  lastVisitedStep: StepId
  completedStepIds: StepId[]
  programCompleted: boolean
  updatedAt: string
  ageInput: string
  ageYears: number | null
  ageDeclined: boolean
  gender: GenderId | null
  runId: string
  usageStartedTracked: boolean
  usageCompletedTracked: boolean
  usageSavedTracked: boolean
  areaScores: Record<LifeAreaId, AreaScore>
  priorityAreaId: LifeAreaId | null
  priorityReason: string
  changeIdeas: string
  candidateValueIds: ValueId[]
  coreValueIds: ValueId[]
  refinedChange: string
  goalValueIds: ValueId[]
  goal: string
  goalPeriod: string
  goalCriteria: string
  goalFeasibility: number | null
  selfChecks: SelfChecks
  actions: [string, string, string]
  primaryActionIndex: 0 | 1 | 2 | null
  actionType: ActionType | null
  actionWhat: string
  actionWhen: string
  actionWhere: string
  actionFrequencyOrDuration: string
  obstacle: string
  alternativeAction: string
  helpResources: HelpResourceId[]
  helpNote: string
  firstActionFeasibility: number | null
  selfEncouragement: string
}

export interface LifeArea {
  id: LifeAreaId
  name: string
  shortName: string
  definition: string
  note?: string
}

export interface CoreValue {
  id: ValueId
  name: string
  definition: string
}

export interface MainStage {
  id: MainStageId
  number: number
  label: string
  stepIds: StepId[]
}
