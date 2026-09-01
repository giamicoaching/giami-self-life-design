import { isValidScore } from './calculations.ts'
import { LIFE_AREAS } from './lifeAreas.ts'
import type { LifeAreaId, ProgramState, StepId, ValueId } from './types.ts'

const UNKNOWN_ONLY = /^(모르겠음|모름|잘\s*모르겠음)[.。!?！？]*$/u

export function isBlank(text: string): boolean {
  return text.trim().length === 0
}

export function isInsufficientGoal(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true
  return UNKNOWN_ONLY.test(trimmed)
}

export function isNoOrUnknownObstacle(text: string): boolean {
  return /^(없음|모름)[.。!?！？]*$/u.test(text.trim())
}

export function isNotApplicableAlternative(text: string): boolean {
  return /^(해당\s*없음|없음|모름)[.。!?！？]*$/u.test(text.trim())
}

export function hasCompleteAreaScores(state: ProgramState, areaIds: LifeAreaId[]): boolean {
  return areaIds.every((id) => {
    const score = state.areaScores[id]
    return isValidScore(score.importance) && isValidScore(score.satisfaction)
  })
}

export function hasAllAreaScores(state: ProgramState): boolean {
  return LIFE_AREAS.every((area) => {
    const score = state.areaScores[area.id]
    return isValidScore(score.importance) && isValidScore(score.satisfaction)
  })
}

export function canProceedFromStep(state: ProgramState, stepId: StepId): boolean {
  switch (stepId) {
    case 'home':
      return true
    case 'step1-1':
      return hasCompleteAreaScores(state, ['selfGrowth', 'workCareer', 'leisure'])
    case 'step1-2':
      return hasCompleteAreaScores(state, ['family', 'health', 'lovePartner'])
    case 'step1-3':
      return hasCompleteAreaScores(state, ['friendsSocial', 'community', 'finance'])
    case 'step1-result':
      return hasAllAreaScores(state)
    case 'step2':
      return state.priorityAreaId !== null && !isBlank(state.priorityReason)
    case 'step3-change':
      return !isBlank(state.changeIdeas)
    case 'step3-candidates':
      return state.candidateValueIds.length === 5
    case 'step3-core':
      return (
        state.coreValueIds.length === 2 &&
        state.coreValueIds.every((id) => state.candidateValueIds.includes(id))
      )
    case 'step3-refine':
      return !isBlank(state.refinedChange)
    case 'step4':
      return isStep4Complete(state)
    case 'step5':
      return isStep5Complete(state)
    case 'summary':
      return true
  }
}

export function isStep4Complete(state: ProgramState): boolean {
  return (
    !isInsufficientGoal(state.goal) &&
    state.goalValueIds.length >= 1 &&
    state.goalValueIds.length <= 2 &&
    state.goalValueIds.every((id) => state.coreValueIds.includes(id)) &&
    isValidScore(state.goalFeasibility)
  )
}

export function isFilledAction(text: string): boolean {
  return !isBlank(text)
}

export function canSelectActionIndex(state: ProgramState, index: 0 | 1 | 2): boolean {
  return isFilledAction(state.actions[index])
}

export function isStep5Complete(state: ProgramState): boolean {
  if (!state.actions.some(isFilledAction)) return false
  if (state.primaryActionIndex === null) return false
  if (!canSelectActionIndex(state, state.primaryActionIndex)) return false
  if (state.actionType === null) return false
  if (isBlank(state.actionWhat) || isBlank(state.actionWhen) || isBlank(state.actionWhere)) {
    return false
  }
  if (state.actionType === 'repeat' && isBlank(state.actionFrequencyOrDuration)) {
    return false
  }
  if (isBlank(state.obstacle)) return false
  if (isNoOrUnknownObstacle(state.obstacle)) {
    if (
      !isBlank(state.alternativeAction) &&
      !isNotApplicableAlternative(state.alternativeAction)
    ) {
      // 없음/모름이어도 대안을 적어도 되지만, 비어 있거나 해당 없음이면 통과
    }
  } else if (isBlank(state.alternativeAction)) {
    return false
  }
  return isValidScore(state.firstActionFeasibility)
}

export function deriveCompletedSteps(state: ProgramState): StepId[] {
  const steps: StepId[] = []
  const sequence: StepId[] = [
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
  ]
  for (const step of sequence) {
    if (!canProceedFromStep(state, step)) break
    steps.push(step)
  }
  return steps
}

export function getFirstIncompleteStep(state: ProgramState): StepId {
  const sequence: StepId[] = [
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
  ]
  for (const step of sequence) {
    if (!canProceedFromStep(state, step)) return step
  }
  return 'summary'
}

const STEP_ORDER: StepId[] = [
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
]

export function canVisitStep(state: ProgramState, stepId: StepId): boolean {
  if (stepId === 'home') return true
  const targetIndex = STEP_ORDER.indexOf(stepId)
  const firstIncomplete = getFirstIncompleteStep(state)
  const incompleteIndex = STEP_ORDER.indexOf(firstIncomplete)
  return targetIndex <= incompleteIndex
}

export function stepValidationMessage(state: ProgramState, stepId: StepId): string | null {
  switch (stepId) {
    case 'step1-1':
    case 'step1-2':
    case 'step1-3':
      return canProceedFromStep(state, stepId)
        ? null
        : '각 영역의 중요도와 만족도를 1부터 7까지 모두 선택해 주세요.'
    case 'step2':
      if (state.priorityAreaId === null) return '우선적으로 다루고 싶은 삶의 영역 1개를 선택해 주세요.'
      if (isBlank(state.priorityReason)) return '선택한 이유를 작성해 주세요.'
      return null
    case 'step3-change':
      return isBlank(state.changeIdeas) ? '원하는 변화 아이디어를 작성해 주세요.' : null
    case 'step3-candidates':
      return state.candidateValueIds.length === 5
        ? null
        : `가치 후보를 정확히 5개 선택해 주세요. (현재 ${state.candidateValueIds.length}개)`
    case 'step3-core':
      return state.coreValueIds.length === 2
        ? null
        : '후보 가운데 핵심 가치를 정확히 2개 선택해 주세요.'
    case 'step3-refine':
      return isBlank(state.refinedChange) ? '두 가치가 반영되도록 원하는 변화를 구체화해 주세요.' : null
    case 'step4':
      if (state.goalValueIds.length < 1) return '목표에 반영할 가치를 1개 또는 2개 선택해 주세요.'
      if (isInsufficientGoal(state.goal)) {
        return '나의 목표를 구체적으로 작성해 주세요. 빈칸이나 ‘모르겠음·모름·잘 모르겠음’만으로는 다음 단계로 갈 수 없습니다.'
      }
      if (!isValidScore(state.goalFeasibility)) return '목표 실현 가능성을 1부터 7까지 평가해 주세요.'
      return null
    case 'step5':
      if (!state.actions.some(isFilledAction)) return '할 수 있는 행동을 최소 1개 작성해 주세요.'
      if (state.primaryActionIndex === null) return '가장 먼저 실행할 우선 실행행동 1개를 선택해 주세요.'
      if (state.actionType === null) return '행동유형을 선택해 주세요.'
      if (isBlank(state.actionWhat) || isBlank(state.actionWhen) || isBlank(state.actionWhere)) {
        return '무엇을, 언제, 어디서 실행할지 작성해 주세요.'
      }
      if (state.actionType === 'repeat' && isBlank(state.actionFrequencyOrDuration)) {
        return '얼마나 자주 실행할지 작성해 주세요.'
      }
      if (isBlank(state.obstacle)) {
        return '장애물을 작성해 주세요. 없으면 ‘없음’, 잘 모르겠으면 ‘모름’이라고 적어 주세요.'
      }
      if (!isNoOrUnknownObstacle(state.obstacle) && isBlank(state.alternativeAction)) {
        return '장애물에 대한 대안행동을 작성해 주세요.'
      }
      if (!isValidScore(state.firstActionFeasibility)) {
        return '첫 행동 실행 가능성을 1부터 7까지 평가해 주세요.'
      }
      return null
    default:
      return null
  }
}

export function toggleLimited<T>(list: T[], item: T, limit: number): T[] {
  if (list.includes(item)) {
    return list.filter((value) => value !== item)
  }
  if (list.length >= limit) return list
  return [...list, item]
}

export function filterValues(ids: ValueId[], allowed: ValueId[]): ValueId[] {
  return ids.filter((id) => allowed.includes(id))
}
