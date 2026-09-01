import type { SelfChecks } from './types.ts'

export const SELF_CHECK_ITEMS: { key: keyof SelfChecks; label: string }[] = [
  { key: 'trulyWanted', label: '내가 진정으로 원하는 목표인가' },
  { key: 'areaValueReflected', label: '선택한 영역과 가치가 반영되었는가' },
  { key: 'specific', label: '무엇이 달라질지 구체적인가' },
  { key: 'feasibleInPeriod', label: '기간 안에 시도 가능한가' },
]

export function selfCheckAnswerLabel(value: boolean | null): string {
  if (value === true) return '예'
  if (value === false) return '아직 보완이 필요함'
  return '미응답'
}
