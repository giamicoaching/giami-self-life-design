import type { MainStage, StepId } from './types.ts'

export const MAIN_STAGES: MainStage[] = [
  {
    id: 'evaluate',
    number: 1,
    label: '삶의 영역 평가',
    stepIds: ['step1-1', 'step1-2', 'step1-3', 'step1-result'],
  },
  {
    id: 'priority',
    number: 2,
    label: '우선 삶의 영역 선택',
    stepIds: ['step2'],
  },
  {
    id: 'change',
    number: 3,
    label: '원하는 변화와 핵심 가치',
    stepIds: ['step3-change', 'step3-candidates', 'step3-core', 'step3-refine'],
  },
  {
    id: 'goal',
    number: 4,
    label: '목표 수립',
    stepIds: ['step4'],
  },
  {
    id: 'action',
    number: 5,
    label: '구체적 행동계획 수립',
    stepIds: ['step5'],
  },
  {
    id: 'summary',
    number: 6,
    label: '종합 결과',
    stepIds: ['summary'],
  },
]

export const STEP_PATHS: Record<StepId, string> = {
  home: '/',
  'step1-1': '/step/1/1',
  'step1-2': '/step/1/2',
  'step1-3': '/step/1/3',
  'step1-result': '/step/1/result',
  step2: '/step/2',
  'step3-change': '/step/3/change',
  'step3-candidates': '/step/3/candidates',
  'step3-core': '/step/3/core',
  'step3-refine': '/step/3/refine',
  step4: '/step/4',
  step5: '/step/5',
  summary: '/summary',
}

export function getMainStageByStep(stepId: StepId): MainStage | null {
  if (stepId === 'home') return null
  return MAIN_STAGES.find((stage) => stage.stepIds.includes(stepId)) ?? null
}

export function getStepProgress(stepId: StepId): { current: number; total: number; percent: number } {
  const total = MAIN_STAGES.length
  const stage = getMainStageByStep(stepId)
  if (!stage) {
    return { current: 0, total, percent: 0 }
  }
  const percent = Math.round((stage.number / total) * 100)
  return { current: stage.number, total, percent }
}

export function pathToStepId(pathname: string): StepId {
  const normalized = pathname.replace(/\/$/, '') || '/'
  const found = (Object.entries(STEP_PATHS) as [StepId, string][]).find(
    ([, path]) => path === normalized,
  )
  return found?.[0] ?? 'home'
}
