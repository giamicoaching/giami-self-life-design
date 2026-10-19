import type { ProgramState } from '../domain/types.ts'
import { FEEDBACK_COMMENT_MAX, FEEDBACK_STAGES } from '../copy/programCopy.ts'

export const FEEDBACK_STAGES_SET = new Set<string>(FEEDBACK_STAGES)

export interface FeedbackRow {
  run_id: string
  helpfulness: number | null
  helpful_stage: string | null
}

export function clampFeedbackComment(text: string): string {
  return Array.from(text).slice(0, FEEDBACK_COMMENT_MAX).join('')
}

export function hasFeedbackAnswer(
  helpfulness: number | null,
  helpfulStage: string | null,
  comment: string,
): boolean {
  if (helpfulness !== null) return true
  if (helpfulStage) return true
  return comment.trim().length > 0
}

export function isFeedbackHelpfulness(value: number | null): value is number {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

export function buildFeedbackRow(
  state: ProgramState,
  input: {
    helpfulness: number | null
    helpfulStage: string | null
    comment: string
  },
): FeedbackRow | null {
  if (!state.runId) return null
  if (typeof input.comment !== 'string') return null
  const helpfulness = isFeedbackHelpfulness(input.helpfulness) ? input.helpfulness : null
  const helpful_stage =
    input.helpfulStage && FEEDBACK_STAGES_SET.has(input.helpfulStage) ? input.helpfulStage : null
  if (helpfulness === null && helpful_stage === null) return null
  return {
    run_id: state.runId,
    helpfulness,
    helpful_stage,
  }
}
