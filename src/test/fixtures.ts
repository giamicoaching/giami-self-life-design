import { createInitialState } from '../domain/initialState.ts'
import { LIFE_AREA_IDS } from '../domain/types.ts'
import type { ProgramState } from '../domain/types.ts'

export function createReadySummaryState(): ProgramState {
  const state = createInitialState()
  for (const id of LIFE_AREA_IDS) {
    state.areaScores[id] = { importance: 6, satisfaction: 3 }
  }
  state.priorityAreaId = 'health'
  state.priorityReason = '건강이 다른 삶의 기반이라고 생각한다.'
  state.changeIdeas = '규칙적으로 걷고 잠을 충분히 자고 싶다.'
  state.candidateValueIds = ['autonomy', 'growth', 'challenge', 'creativity', 'achievement']
  state.coreValueIds = ['growth', 'challenge']
  state.refinedChange = '건강 습관을 꾸준히 만들며 새로운 운동을 시도하고 싶다.'
  state.goalValueIds = ['growth']
  state.goal = '앞으로 3개월 동안 주 3회 30분 걷기를 한다'
  state.goalPeriod = '앞으로 3개월 이내'
  state.goalCriteria = '주 3회 걷기를 8주 이상 기록했을 때'
  state.goalFeasibility = 5
  state.actions = ['걷기 일정 만들기', '수면 일기 쓰기', '']
  state.primaryActionIndex = 0
  state.actionType = 'repeat'
  state.actionWhat = '걷기'
  state.actionWhen = '화요일 저녁'
  state.actionWhere = '집 근처 공원'
  state.actionFrequencyOrDuration = '주 3회'
  state.obstacle = '없음'
  state.alternativeAction = '해당 없음'
  state.firstActionFeasibility = 6
  state.selfChecks = {
    trulyWanted: true,
    areaValueReflected: true,
    specific: false,
    feasibleInPeriod: true,
  }
  state.lastVisitedStep = 'summary'
  return state
}
