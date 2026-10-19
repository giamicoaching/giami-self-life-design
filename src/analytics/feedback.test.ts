import { describe, expect, it } from 'vitest'
import { createInitialState } from '../domain/initialState.ts'
import { FEEDBACK_COMMENT_MAX, FEEDBACK_STAGES } from '../copy/programCopy.ts'
import { buildFeedbackRow, clampFeedbackComment, hasFeedbackAnswer } from './feedback.ts'

describe('feedback payload', () => {
  it('sends only anonymous feedback fields and omits program answers', () => {
    const state = createInitialState()
    state.runId = '11111111-1111-4111-8111-111111111111'
    state.ageYears = 67
    state.gender = 'female'
    state.goal = '주 3회 걷기'
    const row = buildFeedbackRow(state, {
      helpfulness: 4,
      helpfulStage: FEEDBACK_STAGES[4],
      comment: '설명이 더 구체적이면 좋겠습니다.',
    })
    expect(row).toEqual({
      run_id: state.runId,
      helpfulness: 4,
      helpful_stage: '첫 행동 계획',
    })
    expect(Object.keys(row ?? {}).sort()).toEqual(['helpful_stage', 'helpfulness', 'run_id'])
    expect(row).not.toHaveProperty('comment')
    expect(JSON.stringify(row)).not.toContain('설명이 더 구체적이면')
    expect(JSON.stringify(row)).not.toContain('주 3회')
    expect(JSON.stringify(row)).not.toContain('67')
  })

  it('stores a stage without a score and does not store a comment-only answer', () => {
    const state = createInitialState()
    state.ageDeclined = true
    state.gender = 'declined'
    expect(hasFeedbackAnswer(null, null, '')).toBe(false)
    expect(buildFeedbackRow(state, { helpfulness: null, helpfulStage: null, comment: '' })).toBeNull()
    expect(
      buildFeedbackRow(state, { helpfulness: null, helpfulStage: null, comment: '조금 길어요' }),
    ).toBeNull()
    expect(
      buildFeedbackRow(state, {
        helpfulness: null,
        helpfulStage: FEEDBACK_STAGES[0],
        comment: '조금 길어요',
      }),
    ).toEqual({
      run_id: state.runId,
      helpfulness: null,
      helpful_stage: FEEDBACK_STAGES[0],
    })
    expect(clampFeedbackComment('가'.repeat(FEEDBACK_COMMENT_MAX + 8))).toHaveLength(
      FEEDBACK_COMMENT_MAX,
    )
  })
})
