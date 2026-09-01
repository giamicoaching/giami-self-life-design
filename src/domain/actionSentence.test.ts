import { describe, expect, it } from 'vitest'
import { attachWhereParticle, composeActionSentence } from './actionSentence.ts'

describe('composeActionSentence', () => {
  it('does not add 에 after 내일 오전 10시부터', () => {
    const sentence = composeActionSentence({
      what: '전체 구조를 작성한다',
      when: '내일 오전 10시부터',
      where: '집 서재',
      actionType: 'once',
      frequencyOrDuration: '',
    })
    expect(sentence).toBe(
      '나는 내일 오전 10시부터, 집 서재에서 전체 구조를 작성한다',
    )
    expect(sentence).not.toContain('부터에')
  })

  it('renders 매주 월요일 오전 10시 naturally', () => {
    expect(
      composeActionSentence({
        what: '짧은 글을 작성한다',
        when: '매주 월요일 오전 10시',
        where: '카페',
        actionType: 'repeat',
        frequencyOrDuration: '',
      }),
    ).toBe('나는 매주 월요일 오전 10시, 카페에서 짧은 글을 작성한다')
  })

  it('does not add 에 after 시간이 나면', () => {
    const sentence = composeActionSentence({
      what: '자료 목록을 정리한다',
      when: '시간이 나면',
      where: '집',
      actionType: 'once',
      frequencyOrDuration: '',
    })
    expect(sentence).toBe('나는 시간이 나면, 집에서 자료 목록을 정리한다')
    expect(sentence).not.toContain('나면에')
  })

  it('does not duplicate a particle after 회의가 끝난 후', () => {
    const sentence = composeActionSentence({
      what: '메모한다',
      when: '회의가 끝난 후',
      where: '사무실',
      actionType: 'once',
      frequencyOrDuration: '',
    })
    expect(sentence).toBe('나는 회의가 끝난 후, 사무실에서 메모한다')
    expect(sentence).not.toContain('후에에')
    expect(sentence).not.toMatch(/후에/)
  })

  it('does not add 에 after 까지·전·때·마다·되면·하면', () => {
    const cases = [
      '오후 6시까지',
      '회의 전',
      '점심때',
      '매주 월요일마다',
      '시간이 되면',
      '여유가 생기면',
      '일이 끝나면',
    ] as const
    for (const when of cases) {
      const sentence = composeActionSentence({
        what: '정리한다',
        when,
        where: '집',
        actionType: 'once',
        frequencyOrDuration: '',
      })
      expect(sentence).toBe(`나는 ${when}, 집에서 정리한다`)
      expect(sentence).not.toMatch(/(부터|까지|후|전|때|마다|되면|하면|나면)에/)
    }
  })

  it('does not add 한다 when the action already has a predicate', () => {
    expect(
      composeActionSentence({
        what: '챗지피티와 대화하며 전체 구조를 작성한다',
        when: '내일 오전 10시부터',
        where: '집 서재',
        actionType: 'once',
        frequencyOrDuration: '',
      }),
    ).toBe('나는 내일 오전 10시부터, 집 서재에서 챗지피티와 대화하며 전체 구조를 작성한다')
  })

  it('does not duplicate 에서 or trailing periods', () => {
    expect(attachWhereParticle('집에서')).toBe('집에서')
    expect(
      composeActionSentence({
        what: '산책을 한다.',
        when: '저녁',
        where: '집에서',
        actionType: 'once',
        frequencyOrDuration: '',
      }),
    ).toBe('나는 저녁, 집에서 산책을 한다')
  })

  it('omits empty fields and trims whitespace', () => {
    expect(
      composeActionSentence({
        what: '  공부  ',
        when: '',
        where: '도서관',
        actionType: 'once',
        frequencyOrDuration: '',
      }),
    ).toBe('나는 도서관에서 공부를 한다')
  })
})
