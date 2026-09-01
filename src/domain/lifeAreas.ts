import type { LifeArea, LifeAreaId } from './types.ts'
import { LIFE_AREA_IDS } from './types.ts'

export const LIFE_AREAS: LifeArea[] = [
  {
    id: 'selfGrowth',
    name: '자아·성장',
    shortName: '자아·성장',
    definition:
      '자신을 이해하고 존중하며, 자신의 성격·행동·습관과 역량을 원하는 방향으로 발전시켜 가는 영역',
  },
  {
    id: 'workCareer',
    name: '일·커리어',
    shortName: '일·커리어',
    definition:
      '직업·학업·가사·사회활동 등 자신의 주요한 일을 수행하고, 역할과 역량을 발전시켜 가는 영역',
  },
  {
    id: 'leisure',
    name: '여가',
    shortName: '여가',
    definition: '취미·휴식·여행·문화활동 등을 통해 즐거움과 재충전을 얻는 영역',
  },
  {
    id: 'family',
    name: '가족생활',
    shortName: '가족생활',
    definition:
      '배우자·자녀·부모·형제자매 등 가족 구성원과 관계를 맺고 가정생활을 함께 꾸려가는 영역',
  },
  {
    id: 'health',
    name: '건강',
    shortName: '건강',
    definition: '신체적·정신적 건강을 유지하고 관리하는 영역',
  },
  {
    id: 'lovePartner',
    name: '사랑·파트너 관계',
    shortName: '사랑·파트너',
    definition:
      '배우자 또는 연인과의 사랑과 친밀감뿐 아니라, 그러한 관계의 유무를 포함하여 현재의 사랑·파트너 관계 상태를 살펴보는 영역',
    note: '배우자나 연인이 없어도 현재 상태를 기준으로 응답해 주세요.',
  },
  {
    id: 'friendsSocial',
    name: '친구·사회적 관계',
    shortName: '친구·사회',
    definition:
      '친구·동료·이웃 등 가족과 파트너 이외의 사람들과 관계를 맺고 교류하는 영역',
  },
  {
    id: 'community',
    name: '공동체·기여',
    shortName: '공동체·기여',
    definition:
      '직장·학교·지역사회·종교단체·동호회·봉사단체 등의 공동체에 참여하고 다른 사람이나 사회에 기여하는 영역',
  },
  {
    id: 'finance',
    name: '재정',
    shortName: '재정',
    definition: '소득·지출·저축·자산·부채 등을 관리하고 경제적 안정을 유지하는 영역',
  },
]

export const AREA_PAGES: LifeAreaId[][] = [
  ['selfGrowth', 'workCareer', 'leisure'],
  ['family', 'health', 'lovePartner'],
  ['friendsSocial', 'community', 'finance'],
]

export function getLifeArea(id: LifeAreaId): LifeArea {
  const area = LIFE_AREAS.find((item) => item.id === id)
  if (!area) {
    throw new Error(`Unknown life area: ${id}`)
  }
  return area
}

export function isLifeAreaId(value: string): value is LifeAreaId {
  return (LIFE_AREA_IDS as readonly string[]).includes(value)
}
