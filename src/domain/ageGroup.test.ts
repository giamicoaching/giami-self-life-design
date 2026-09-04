import { describe, expect, it } from 'vitest'
import { analyticsAgeGroup, parseExactAge, toAgeGroup } from './ageGroup.ts'

describe('toAgeGroup', () => {
  it('maps 18-19 to 18-19', () => {
    expect(toAgeGroup(18)).toBe('18-19')
    expect(toAgeGroup(19)).toBe('18-19')
  })

  it('maps 20-24 to 20-24', () => {
    expect(toAgeGroup(20)).toBe('20-24')
    expect(toAgeGroup(21)).toBe('20-24')
    expect(toAgeGroup(24)).toBe('20-24')
  })

  it('maps later ages into 5-year bands', () => {
    expect(toAgeGroup(25)).toBe('25-29')
    expect(toAgeGroup(29)).toBe('25-29')
    expect(toAgeGroup(52)).toBe('50-54')
    expect(toAgeGroup(58)).toBe('55-59')
    expect(toAgeGroup(63)).toBe('60-64')
    expect(toAgeGroup(67)).toBe('65-69')
    expect(toAgeGroup(75)).toBe('75-79')
    expect(toAgeGroup(79)).toBe('75-79')
  })

  it('maps 80 and above to 80+', () => {
    expect(toAgeGroup(80)).toBe('80+')
    expect(toAgeGroup(100)).toBe('80+')
  })

  it('rejects ages below 18 and above 100', () => {
    expect(toAgeGroup(17)).toBeNull()
    expect(toAgeGroup(101)).toBeNull()
    expect(parseExactAge('17')).toBeNull()
    expect(parseExactAge('101')).toBeNull()
    expect(parseExactAge('abc')).toBeNull()
  })
})

describe('analyticsAgeGroup', () => {
  it('maps declined age to not_provided without using the exact age', () => {
    expect(analyticsAgeGroup(67, true)).toBe('not_provided')
    expect(analyticsAgeGroup(null, true)).toBe('not_provided')
  })
})
