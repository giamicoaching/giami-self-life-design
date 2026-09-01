import { eulReul, gwaWa } from './actionSentence.ts'
import type { LifeAreaId } from './types.ts'

export const GENERIC_REFINE_EXAMPLE =
  '예: ‘성장’과 ‘균형’을 선택했다면, 새로운 일을 배우고 시도하되 생활 리듬을 해치지 않는 방식으로 꾸준히 발전하고 싶다.'

export function refineChangeExample(valueNames: string[]): string {
  if (valueNames.length !== 2) return GENERIC_REFINE_EXAMPLE
  const first = valueNames[0]?.trim() ?? ''
  const second = valueNames[1]?.trim() ?? ''
  if (!first || !second) return GENERIC_REFINE_EXAMPLE
  return `예: ‘${first}’${gwaWa(first)} ‘${second}’${eulReul(second)} 선택했다면, 새로운 일을 배우고 시도하되 생활 리듬을 해치지 않는 방식으로 꾸준히 발전하고 싶다.`
}

export const GENERIC_CHANGE_EXAMPLE =
  '예: 여가 영역에서 주말에 즐길 수 있는 취미를 새로 시작하고, 규칙적으로 시간을 내고 싶다.'

const CHANGE_EXAMPLES: Record<LifeAreaId, string> = {
  selfGrowth:
    '예: 자아·성장 영역에서 하루 10분 성찰 일기를 쓰고, 원하는 습관을 하나씩 만들고 싶다.',
  workCareer:
    '예: 일·커리어 영역에서 맡은 일의 우선순위를 분명히 하고, 역량을 키울 학습을 규칙적으로 하고 싶다.',
  leisure: GENERIC_CHANGE_EXAMPLE,
  family:
    '예: 가족생활 영역에서 가족과 대화하는 시간을 늘리고, 함께하는 일과를 더 자주 만들고 싶다.',
  health: '예: 건강 영역에서 주 3회 가볍게 걷고, 잠자리에 드는 시간을 일정하게 유지하고 싶다.',
  lovePartner:
    '예: 사랑·파트너 관계 영역에서 현재의 관계 상태를 솔직히 살피고, 원하는 친밀감을 천천히 만들어가고 싶다.',
  friendsSocial:
    '예: 친구·사회적 관계 영역에서 마음에 맞는 사람과 정기적으로 만나고, 가벼운 교류를 이어가고 싶다.',
  community:
    '예: 공동체·기여 영역에서 관심 있는 모임에 참여하고, 내가 도울 수 있는 일을 작게 시작하고 싶다.',
  finance: '예: 재정 영역에서 한 달 지출을 기록하고, 저축 습관을 꾸준히 만들고 싶다.',
}

export function changeIdeaPlaceholder(areaId: LifeAreaId | null): string {
  if (!areaId) return GENERIC_CHANGE_EXAMPLE
  return CHANGE_EXAMPLES[areaId] ?? GENERIC_CHANGE_EXAMPLE
}

export const ACTION_PLACEHOLDERS = [
  '예: 필요한 기능 목록 작성하기',
  '예: 화면 구성 스케치하기',
  '예: 첫 화면 개발하기',
] as const

export const GOAL_PERIOD_PLACEHOLDER = '예: 앞으로 3개월 이내'
export const GOAL_CRITERIA_PLACEHOLDER =
  '예: 주요 기능을 완성하고 3명 이상에게 사용 후기를 받았을 때'
