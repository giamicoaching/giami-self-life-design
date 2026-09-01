import type { AreaScore } from './types.ts'

export const SCORE_MIN = 1
export const SCORE_MAX = 7
export const CHANGE_INDEX_MIN = 0
export const CHANGE_INDEX_MAX = 36

export function isValidScore(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= SCORE_MIN && value <= SCORE_MAX
}

/** 변화검토지수 = (중요도 − 1) × (7 − 만족도), 범위 0~36 */
export function changeReviewIndex(score: AreaScore): number | null {
  if (!isValidScore(score.importance) || !isValidScore(score.satisfaction)) {
    return null
  }
  const index = (score.importance - 1) * (7 - score.satisfaction)
  return Math.min(CHANGE_INDEX_MAX, Math.max(CHANGE_INDEX_MIN, index))
}

export function clampScore(value: number): number {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(value)))
}
