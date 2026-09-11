import { useRef, useState } from 'react'
import {
  FEEDBACK_COMMENT_LABEL,
  FEEDBACK_COMMENT_MAX,
  FEEDBACK_ERROR,
  FEEDBACK_HELPFULNESS_HIGH,
  FEEDBACK_HELPFULNESS_LABEL,
  FEEDBACK_HELPFULNESS_LOW,
  FEEDBACK_HELPFULNESS_MID,
  FEEDBACK_PRIVACY,
  FEEDBACK_STAGE_LABEL,
  FEEDBACK_STAGES,
  FEEDBACK_SUBMIT_LABEL,
  FEEDBACK_SUCCESS,
  FEEDBACK_TITLE,
  OPTIONAL_FIELD_MARK,
} from '../copy/programCopy.ts'
import {
  buildFeedbackRow,
  clampFeedbackComment,
  hasFeedbackAnswer,
} from '../analytics/feedback.ts'
import { submitLifeDesignFeedback } from '../analytics/submitFeedback.ts'
import { Button } from './ui/Button.tsx'
import { useProgram } from '../state/ProgramProvider.tsx'

export function SummaryFeedback() {
  const { state, dispatch, saveNow } = useProgram()
  const [helpfulness, setHelpfulness] = useState<number | null>(null)
  const [helpfulStage, setHelpfulStage] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)
  const submitted = state.feedbackSubmitted
  const canSubmit = hasFeedbackAnswer(helpfulness, helpfulStage, comment)
  const commentLength = Array.from(comment).length

  const handleCommentChange = (value: string) => {
    setComment(clampFeedbackComment(value))
    setError(null)
  }

  const handleSubmit = async () => {
    if (submitted || submittingRef.current || !canSubmit) return
    const row = buildFeedbackRow(state, { helpfulness, helpfulStage, comment })
    if (!row) return
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    const result = await submitLifeDesignFeedback(row)
    if (result === 'ok' || result === 'duplicate') {
      dispatch({ type: 'MARK_FEEDBACK_SUBMITTED' })
      saveNow({ feedbackSubmitted: true })
      submittingRef.current = false
      setSubmitting(false)
      return
    }
    submittingRef.current = false
    setSubmitting(false)
    if (result !== 'busy') setError(FEEDBACK_ERROR)
  }

  return (
    <section className="summary-feedback no-print" aria-labelledby="feedback-title">
      <h2 id="feedback-title">{FEEDBACK_TITLE}</h2>
      <p className="feedback-privacy">{FEEDBACK_PRIVACY}</p>
      {submitted ? (
        <p className="feedback-status" role="status" aria-live="polite">
          {FEEDBACK_SUCCESS}
        </p>
      ) : (
        <>
          <fieldset className="feedback-scale">
            <legend>
              {FEEDBACK_HELPFULNESS_LABEL}{' '}
              <span className="field-optional">{OPTIONAL_FIELD_MARK}</span>
            </legend>
            <div className="feedback-scale-ends">
              <span>1 {FEEDBACK_HELPFULNESS_LOW}</span>
              <span>5 {FEEDBACK_HELPFULNESS_HIGH}</span>
            </div>
            <div
              className="feedback-scale-options"
              role="radiogroup"
              aria-label={FEEDBACK_HELPFULNESS_LABEL}
            >
              {[1, 2, 3, 4, 5].map((score) => {
                const extra =
                  score === 1
                    ? FEEDBACK_HELPFULNESS_LOW
                    : score === 3
                      ? FEEDBACK_HELPFULNESS_MID
                      : score === 5
                        ? FEEDBACK_HELPFULNESS_HIGH
                        : undefined
                return (
                  <label
                    key={score}
                    className={helpfulness === score ? 'scale-option is-selected' : 'scale-option'}
                  >
                    <input
                      type="radio"
                      name="feedback-helpfulness"
                      value={score}
                      checked={helpfulness === score}
                      onChange={() => {
                        setHelpfulness(score)
                        setError(null)
                      }}
                    />
                    <span>{score}</span>
                    <span className="sr-only">{extra ? `점, ${extra}` : '점'}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="feedback-stages">
            <legend>
              {FEEDBACK_STAGE_LABEL} <span className="field-optional">{OPTIONAL_FIELD_MARK}</span>
            </legend>
            {FEEDBACK_STAGES.map((stage) => (
              <label key={stage} className="check-line">
                <input
                  type="radio"
                  name="feedback-stage"
                  value={stage}
                  checked={helpfulStage === stage}
                  onChange={() => {
                    setHelpfulStage(stage)
                    setError(null)
                  }}
                />
                {stage}
              </label>
            ))}
          </fieldset>

          <div className="field question-block">
            <label className="field-label" htmlFor="feedback-comment">
              {FEEDBACK_COMMENT_LABEL}
              <span className="field-optional">{OPTIONAL_FIELD_MARK}</span>
            </label>
            <textarea
              id="feedback-comment"
              className="input"
              rows={4}
              maxLength={FEEDBACK_COMMENT_MAX}
              value={comment}
              onChange={(event) => handleCommentChange(event.target.value)}
            />
            <p className="feedback-count" aria-live="polite">
              {commentLength} / {FEEDBACK_COMMENT_MAX}
            </p>
          </div>

          {error ? (
            <p className="feedback-status feedback-status-error" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}

          <Button onClick={() => void handleSubmit()} disabled={!canSubmit || submitting}>
            {FEEDBACK_SUBMIT_LABEL}
          </Button>
        </>
      )}
    </section>
  )
}
