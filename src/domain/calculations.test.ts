import { describe, expect, it } from 'vitest'
import { changeReviewIndex, isValidScore } from './calculations.ts'

describe('changeReviewIndex', () => {
  it('uses (importance - 1) * (7 - satisfaction)', () => {
    expect(changeReviewIndex({ importance: 7, satisfaction: 4 })).toBe(18)
    expect(changeReviewIndex({ importance: 1, satisfaction: 7 })).toBe(0)
    expect(changeReviewIndex({ importance: 7, satisfaction: 1 })).toBe(36)
    expect(changeReviewIndex({ importance: 4, satisfaction: 4 })).toBe(9)
  })

  it('returns null when a score is missing', () => {
    expect(changeReviewIndex({ importance: null, satisfaction: 4 })).toBeNull()
    expect(changeReviewIndex({ importance: 5, satisfaction: null })).toBeNull()
  })

  it('accepts only 1-7 integer scores', () => {
    expect(isValidScore(0)).toBe(false)
    expect(isValidScore(8)).toBe(false)
    expect(isValidScore(3.5)).toBe(false)
    expect(isValidScore(7)).toBe(true)
  })
})
