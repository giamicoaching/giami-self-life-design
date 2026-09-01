import type { CoreValue, HelpResourceId, ValueId } from './types.ts'
import { VALUE_IDS } from './types.ts'

export const CORE_VALUES: CoreValue[] = [
  {
    id: 'autonomy',
    name: '자율',
    definition: '자신의 판단과 선택에 따라 삶을 주도적으로 이끌어 가는 것',
  },
  {
    id: 'growth',
    name: '성장',
    definition: '배우고 경험하면서 자신의 역량과 가능성을 발전시켜 가는 것',
  },
  {
    id: 'challenge',
    name: '도전',
    definition: '불확실성이 있더라도 새로운 목표와 경험을 시도하는 것',
  },
  {
    id: 'creativity',
    name: '창의',
    definition: '새로운 아이디어와 방법을 생각하고 적용하는 것',
  },
  {
    id: 'achievement',
    name: '성취',
    definition: '의미 있는 목표를 정하고 노력하여 원하는 결과를 이루는 것',
  },
  {
    id: 'responsibility',
    name: '책임',
    definition: '맡은 역할과 약속을 성실하게 수행하고 결과를 감당하는 것',
  },
  {
    id: 'authenticity',
    name: '진정성',
    definition: '자신의 생각·감정·신념을 이해하고 이에 일치하게 행동하는 것',
  },
  {
    id: 'stability',
    name: '안정',
    definition: '삶의 중요한 기반을 안전하고 지속 가능한 상태로 유지하는 것',
  },
  {
    id: 'balance',
    name: '균형',
    definition: '삶의 요구 사이에서 시간과 에너지를 적절하게 배분하는 것',
  },
  {
    id: 'pleasure',
    name: '즐거움',
    definition: '일상에서 재미·기쁨·만족과 활력을 경험하고 누리는 것',
  },
  {
    id: 'innerPeace',
    name: '내적 평안',
    definition: '어려움 속에서도 경험을 수용하며 마음의 평정을 유지하는 것',
  },
  {
    id: 'respect',
    name: '존중',
    definition: '자신과 타인의 존엄성·생각·감정·차이를 소중하게 대하는 것',
  },
  {
    id: 'care',
    name: '돌봄',
    definition: '자신과 타인의 필요를 살피고 관심·배려와 도움을 제공하는 것',
  },
  {
    id: 'intimacy',
    name: '친밀감',
    definition: '중요한 사람과 생각과 감정을 나누며 신뢰로운 관계를 형성하는 것',
  },
  {
    id: 'cooperation',
    name: '협력',
    definition: '공동의 목적을 위해 소통하고 역할을 나누며 함께 노력하는 것',
  },
  {
    id: 'fairness',
    name: '공정',
    definition: '정당하고 일관된 기준에 따라 판단하고 사람을 대하는 것',
  },
  {
    id: 'contribution',
    name: '기여',
    definition: '자신의 시간·능력·자원을 활용해 다른 사람이나 사회에 도움이 되는 것',
  },
  {
    id: 'meaning',
    name: '의미',
    definition: '삶과 활동에서 중요한 이유와 목적을 발견하고 추구하는 것',
  },
]

export const HELP_RESOURCES: { id: HelpResourceId; label: string }[] = [
  { id: 'people', label: '사람 (가족, 친구, 동료, 전문가 등)' },
  { id: 'information', label: '정보' },
  { id: 'materials', label: '자료' },
  { id: 'tools', label: '도구' },
]

export function getCoreValue(id: ValueId): CoreValue {
  const value = CORE_VALUES.find((item) => item.id === id)
  if (!value) {
    throw new Error(`Unknown value: ${id}`)
  }
  return value
}

export function isValueId(value: string): value is ValueId {
  return (VALUE_IDS as readonly string[]).includes(value)
}
