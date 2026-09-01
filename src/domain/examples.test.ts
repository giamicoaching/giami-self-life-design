import { describe, expect, it } from 'vitest'
import { LIFE_AREA_IDS } from './types.ts'
import {
  ACTION_PLACEHOLDERS,
  GENERIC_CHANGE_EXAMPLE,
  GENERIC_REFINE_EXAMPLE,
  changeIdeaPlaceholder,
  refineChangeExample,
} from './examples.ts'

describe('refineChangeExample', () => {
  it('builds a dynamic example with 과/와 and 을/를', () => {
    expect(refineChangeExample(['성장', '균형'])).toBe(GENERIC_REFINE_EXAMPLE)
    expect(refineChangeExample(['도전', '자율'])).toContain('‘도전’과 ‘자율’을 선택했다면')
    expect(refineChangeExample(['창의', '즐거움'])).toContain('‘창의’와 ‘즐거움’을 선택했다면')
  })

  it('falls back to the generic example when two names are not available', () => {
    expect(refineChangeExample([])).toBe(GENERIC_REFINE_EXAMPLE)
    expect(refineChangeExample(['성장'])).toBe(GENERIC_REFINE_EXAMPLE)
  })
})

describe('change idea placeholders', () => {
  it('provides a distinct example for every life area', () => {
    const examples = LIFE_AREA_IDS.map((id) => changeIdeaPlaceholder(id))
    expect(changeIdeaPlaceholder(null)).toBe(GENERIC_CHANGE_EXAMPLE)
    expect(changeIdeaPlaceholder('leisure')).toBe(GENERIC_CHANGE_EXAMPLE)
    expect(new Set(examples).size).toBe(LIFE_AREA_IDS.length)
    for (const example of examples) {
      expect(example.startsWith('예:')).toBe(true)
    }
  })
})

describe('action placeholders', () => {
  it('gives a distinct example for each action field', () => {
    expect(ACTION_PLACEHOLDERS[0]).toContain('필요한 기능 목록 작성하기')
    expect(ACTION_PLACEHOLDERS[1]).toContain('화면 구성 스케치하기')
    expect(ACTION_PLACEHOLDERS[2]).toContain('첫 화면 개발하기')
    expect(new Set(ACTION_PLACEHOLDERS).size).toBe(3)
  })
})
