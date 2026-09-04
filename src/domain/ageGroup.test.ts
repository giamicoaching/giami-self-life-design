import { describe, expect, it } from 'vitest'
import { parseExactAge, toAgeGroup } from './ageGroup.ts'

describe('toAgeGroup', () => {
  it('maps 18 to 18-19', () => {
    expect(toAgeGroup(18)).toBe('18-19')
    expect(toAgeGroup(19)).toBe('18-19')
  })

  it('maps 20 and 24 to 20-24', () => {
    expect(toAgeGroup(20)).toBe('20-24')
    expect(toAgeGroup(24)).toBe('20-24')
  })

  it('maps 25 to 25-29', () => {
    expect(toAgeGroup(25)).toBe('25-29')
  })

  it('maps 52, 58, 63, and 67 to 5-year bands', () => {
    expect(toAgeGroup(52)).toBe('50-54')
    expect(toAgeGroup(58)).toBe('55-59')
    expect(toAgeGroup(63)).toBe('60-64')
    expect(toAgeGroup(67)).toBe('65-69')
  })

  it('maps 80 and 100 to 80-plus', () => {
    expect(toAgeGroup(80)).toBe('80-plus')
    expect(toAgeGroup(100)).toBe('80-plus')
  })

  it('rejects ages below 18 and above 100', () => {
    expect(toAgeGroup(17)).toBeNull()
    expect(toAgeGroup(101)).toBeNull()
    expect(parseExactAge('17')).toBeNull()
    expect(parseExactAge('101')).toBeNull()
    expect(parseExactAge('abc')).toBeNull()
  })
})
