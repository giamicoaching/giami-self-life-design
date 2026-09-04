export const MIN_AGE = 18
export const MAX_AGE = 100

export const AGE_GROUPS = [
  '18-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65-69',
  '70-74',
  '75-79',
  '80-plus',
  'declined',
] as const

export type AgeGroup = (typeof AGE_GROUPS)[number]

export function isValidExactAge(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_AGE && value <= MAX_AGE
}

export function parseExactAge(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!/^\d+$/.test(trimmed)) return null
  const age = Number(trimmed)
  return isValidExactAge(age) ? age : null
}

/** 만 나이를 5년 단위 연령대 코드로 변환한다. 유효하지 않으면 null. */
export function toAgeGroup(age: number): AgeGroup | null {
  if (!isValidExactAge(age)) return null
  if (age <= 19) return '18-19'
  if (age >= 80) return '80-plus'
  const start = Math.floor(age / 5) * 5
  return `${start}-${start + 4}` as AgeGroup
}

export function analyticsAgeGroup(ageYears: number | null, declined: boolean): AgeGroup | null {
  if (declined) return 'declined'
  if (ageYears === null) return null
  return toAgeGroup(ageYears)
}
