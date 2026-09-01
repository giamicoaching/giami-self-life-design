import { describe, expect, it } from 'vitest'
import { LIFE_AREAS } from './lifeAreas.ts'

describe('life area definitions', () => {
  it('ends every definition with exactly 영역', () => {
    for (const area of LIFE_AREAS) {
      expect(area.definition.endsWith('영역')).toBe(true)
      expect(area.definition.endsWith('영역입니다.')).toBe(false)
      expect(area.definition.endsWith('영역입니다')).toBe(false)
    }
  })

  it('uses the requested family and partner wording', () => {
    expect(LIFE_AREAS.find((area) => area.id === 'family')?.definition).toBe(
      '배우자·자녀·부모·형제자매 등 가족 구성원과 관계를 맺고 가정생활을 함께 꾸려가는 영역',
    )
    expect(LIFE_AREAS.find((area) => area.id === 'lovePartner')?.definition).toBe(
      '배우자 또는 연인과의 사랑과 친밀감뿐 아니라, 그러한 관계의 유무를 포함하여 현재의 사랑·파트너 관계 상태를 살펴보는 영역',
    )
  })
})
