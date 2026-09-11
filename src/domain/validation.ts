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
    case 'summary':
      return true
    case 'step1-result':
      return hasAllAreaScores(state)
    default:
      return getMissingFields(state, stepId).length === 0
  }
}

export function isStep4Complete(state: ProgramState): boolean {
  return getMissingFields(state, 'step4').length === 0
}

export function isFilledAction(text: string): boolean {
  return !isBlank(text)
}

export function canSelectActionIndex(state: ProgramState, index: 0 | 1 | 2): boolean {
  return isFilledAction(state.actions[index])
}

export function isStep5Complete(state: ProgramState): boolean {
  return getMissingFields(state, 'step5').length === 0
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
  return getMissingFields(state, stepId)[0]?.message ?? null
}

export const MISSING_RESPONSE_LABEL = '입력 필요'
export const INCOMPLETE_STEP_BANNER = '완료하지 않은 항목이 있어 해당 단계로 이동했습니다.'
export const MISSING_RESPONSE_BANNER_ONE =
  '아직 응답하지 않은 항목이 있습니다. 표시된 질문을 확인해 주세요.'

export function missingResponseBanner(count: number): string {
  if (count <= 1) return MISSING_RESPONSE_BANNER_ONE
  return `아직 응답하지 않은 항목이 ${count}개 있습니다. 첫 번째 항목으로 이동했습니다.`
}

export interface MissingField {
  id: string
  message: string
  questionId: string
  focusId: string
}

export interface ValidationLocationState {
  focusMissing?: boolean
  fromIncompleteStep?: boolean
}

export function incompleteStepLocationState(): ValidationLocationState {
  return { focusMissing: true, fromIncompleteStep: true }
}

export function isValidationLocationState(
  value: unknown,
): value is ValidationLocationState {
  if (!value || typeof value !== 'object') return false
  const state = value as ValidationLocationState
  return Boolean(state.focusMissing || state.fromIncompleteStep)
}

function field(
  id: string,
  message: string,
  questionId = id,
  focusId = id,
): MissingField {
  return { id, message, questionId, focusId }
}

export function getMissingFields(state: ProgramState, stepId: StepId): MissingField[] {
  switch (stepId) {
    case 'step1-1':
      return missingAreaScoreFields(state, ['selfGrowth', 'workCareer', 'leisure'])
    case 'step1-2':
      return missingAreaScoreFields(state, ['family', 'health', 'lovePartner'])
    case 'step1-3':
      return missingAreaScoreFields(state, ['friendsSocial', 'community', 'finance'])
    case 'step2': {
      const missing: MissingField[] = []
      if (state.priorityAreaId === null) {
        missing.push(
          field(
            'priority-area',
            '우선적으로 다루고 싶은 삶의 영역 1개를 선택해 주세요.',
            'question-priority-area',
            'first-field',
          ),
        )
      }
      if (isBlank(state.priorityReason)) {
        missing.push(
          field(
            'priority-reason',
            '선택한 이유를 작성해 주세요.',
            'question-priority-reason',
            'priority-reason',
          ),
        )
      }
      return missing
    }
    case 'step3-change':
      return isBlank(state.changeIdeas)
        ? [
            field(
              'change-ideas',
              '원하는 변화 아이디어를 작성해 주세요.',
              'question-change-ideas',
              'first-field',
            ),
          ]
        : []
    case 'step3-candidates':
      return state.candidateValueIds.length === 5
        ? []
        : [
            field(
              'candidate-values',
              `가치 후보를 정확히 5개 선택해 주세요. (현재 ${state.candidateValueIds.length}개)`,
              'question-candidate-values',
              'question-candidate-values',
            ),
          ]
    case 'step3-core':
      return state.coreValueIds.length === 2 &&
        state.coreValueIds.every((id) => state.candidateValueIds.includes(id))
        ? []
        : [
            field(
              'core-values',
              '핵심가치를 두 개 선택해 주세요.',
              'question-core-values',
              'question-core-values',
            ),
          ]
    case 'step3-refine':
      return isBlank(state.refinedChange)
        ? [
            field(
              'refined-change',
              '두 가치가 반영되도록 원하는 변화를 구체화해 주세요.',
              'question-refined-change',
              'first-field',
            ),
          ]
        : []
    case 'step4':
      return missingStep4Fields(state)
    case 'step5':
      return missingStep5Fields(state)
    default:
      return []
  }
}

function missingAreaScoreFields(
  state: ProgramState,
  areaIds: LifeAreaId[],
): MissingField[] {
  const missing: MissingField[] = []
  for (const areaId of areaIds) {
    const area = LIFE_AREAS.find((item) => item.id === areaId)
    const name = area?.name ?? areaId
    const score = state.areaScores[areaId]
    if (!isValidScore(score.importance)) {
      missing.push(
        field(
          `${areaId}-importance`,
          `${name}의 중요도를 1점부터 7점 사이에서 선택해 주세요.`,
          `${areaId}-importance`,
          `${areaId}-importance-1`,
        ),
      )
    }
    if (!isValidScore(score.satisfaction)) {
      missing.push(
        field(
          `${areaId}-satisfaction`,
          `${name}의 만족도를 1점부터 7점 사이에서 선택해 주세요.`,
          `${areaId}-satisfaction`,
          `${areaId}-satisfaction-1`,
        ),
      )
    }
  }
  return missing
}

function missingStep4Fields(state: ProgramState): MissingField[] {
  const missing: MissingField[] = []
  if (
    state.goalValueIds.length < 1 ||
    state.goalValueIds.length > 2 ||
    !state.goalValueIds.every((id) => state.coreValueIds.includes(id))
  ) {
    missing.push(
      field(
        'goal-values',
        '목표에 반영할 가치를 1개 또는 2개 선택해 주세요.',
        'question-goal-values',
        'question-goal-values',
      ),
    )
  }
  if (isInsufficientGoal(state.goal)) {
    missing.push(
      field(
        'goal',
        isBlank(state.goal)
          ? '목표 내용을 작성해 주세요.'
          : '나의 목표를 구체적으로 작성해 주세요. 빈칸이나 ‘모르겠음·모름·잘 모르겠음’만으로는 다음 단계로 갈 수 없습니다.',
        'question-goal',
        'goal',
      ),
    )
  }
  if (!isValidScore(state.goalFeasibility)) {
    missing.push(
      field(
        'goal-feasibility',
        '목표 실현 가능성을 1점부터 7점 사이에서 선택해 주세요.',
        'goal-feasibility',
        'goal-feasibility-1',
      ),
    )
  }
  return missing
}

function missingStep5Fields(state: ProgramState): MissingField[] {
  const missing: MissingField[] = []
  if (!state.actions.some(isFilledAction)) {
    missing.push(
      field(
        'actions',
        '할 수 있는 행동을 한 가지 이상 작성해 주세요.',
        'question-actions',
        'first-field',
      ),
    )
  }
  if (
    state.primaryActionIndex === null ||
    !canSelectActionIndex(state, state.primaryActionIndex)
  ) {
    missing.push(
      field(
        'primary-action',
        '가장 먼저 실행할 행동을 선택해 주세요.',
        'question-primary-action',
        'question-primary-action',
      ),
    )
  }
  if (state.actionType === null) {
    missing.push(
      field(
        'action-type',
        '행동유형을 선택해 주세요.',
        'question-action-type',
        'action-type-once',
      ),
    )
  }
  if (isBlank(state.actionWhat)) {
    missing.push(
      field(
        'action-what',
        '무엇을 실행할지 작성해 주세요.',
        'question-action-what',
        'action-what',
      ),
    )
  }
  if (isBlank(state.actionWhen)) {
    missing.push(
      field(
        'action-when',
        '실행할 시기를 입력해 주세요.',
        'question-action-when',
        'action-when',
      ),
    )
  }
  if (isBlank(state.actionWhere)) {
    missing.push(
      field(
        'action-where',
        '실행할 장소를 입력해 주세요.',
        'question-action-where',
        'action-where',
      ),
    )
  }
  if (state.actionType === 'repeat' && isBlank(state.actionFrequencyOrDuration)) {
    missing.push(
      field(
        'action-frequency',
        '실행 빈도를 입력해 주세요.',
        'question-action-frequency',
        'action-freq',
      ),
    )
  }
  if (isBlank(state.obstacle)) {
    missing.push(
      field(
        'obstacle',
        '예상되는 장애물을 입력하거나 ‘없음’ 또는 ‘모름’을 선택해 주세요.',
        'question-obstacle',
        'obstacle',
      ),
    )
  } else if (!isNoOrUnknownObstacle(state.obstacle) && isBlank(state.alternativeAction)) {
    missing.push(
      field(
        'alternative',
        '장애물에 대한 대안행동을 작성해 주세요.',
        'question-alternative',
        'alternative',
      ),
    )
  }
  if (!isValidScore(state.firstActionFeasibility)) {
    missing.push(
      field(
        'first-feasibility',
        '실행 가능성을 1점부터 7점 사이에서 선택해 주세요.',
        'first-feasibility',
        'first-feasibility-1',
      ),
    )
  }
  return missing
}

export function firstIncompleteStepBefore(
  state: ProgramState,
  currentStep: StepId,
): StepId | null {
  const first = getFirstIncompleteStep(state)
  if (STEP_ORDER.indexOf(first) < STEP_ORDER.indexOf(currentStep)) return first
  return null
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
