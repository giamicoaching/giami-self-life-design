import { parseExactAge } from './ageGroup.ts'
import { GENDER_IDS, type GenderId, type ProgramState } from './types.ts'

export type { GenderId }

export const GENDER_OPTIONS: { id: GenderId; label: string }[] = [
  { id: 'male', label: '남성' },
  { id: 'female', label: '여성' },
  { id: 'declined', label: '응답하지 않음' },
]

export function isGenderId(value: unknown): value is GenderId {
  return typeof value === 'string' && (GENDER_IDS as readonly string[]).includes(value)
}

export const DEMOGRAPHICS_NOTICE =
  '프로그램 이용현황을 파악하기 위해 프로그램 시작·완료·결과 저장 여부와 5년 단위 연령대 및 성별만 개인을 식별하지 않는 통계로 전송됩니다. 정확한 만 나이와 프로그램에서 작성한 점수, 선택 내용 및 서술형 응답은 서버로 전송되지 않고 현재 브라우저에만 저장됩니다.'

export const USAGE_INFO_TITLE = '이용정보 안내'

export const AGE_PLACEHOLDER = '예: 67'
export const AGE_REQUIRED_MESSAGE = '만 나이를 입력하거나 ‘응답하지 않음’을 선택해 주세요.'
export const AGE_INVALID_MESSAGE = '만 나이는 18세 이상 100세 이하의 숫자로 입력해 주세요.'
export const GENDER_REQUIRED_MESSAGE = '성별 항목 중 하나를 선택해 주세요.'
export const DEMOGRAPHICS_PATH = '/info'
export const DEMOGRAPHICS_NEXT_LABEL = '삶의 영역 평가 시작하기'

export function hasCompleteDemographics(state: ProgramState): boolean {
  if (state.gender === null) return false
  if (state.ageDeclined) return true
  return state.ageYears !== null
}

export function demographicsFieldErrors(state: ProgramState): {
  age: string | null
  gender: string | null
} {
  const age = state.ageDeclined
    ? null
    : parseExactAge(state.ageInput)
      ? null
      : state.ageInput.trim()
        ? AGE_INVALID_MESSAGE
        : AGE_REQUIRED_MESSAGE
  const gender = state.gender === null ? GENDER_REQUIRED_MESSAGE : null
  return { age, gender }
}
