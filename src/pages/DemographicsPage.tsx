import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trackLifeDesignStarted } from '../analytics/usage.ts'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { SiteFooter } from '../components/SiteFooter.tsx'
import { parseExactAge } from '../domain/ageGroup.ts'
import {
  AGE_INVALID_MESSAGE,
  AGE_PLACEHOLDER,
  DEMOGRAPHICS_NEXT_LABEL,
  DEMOGRAPHICS_NOTICE,
  GENDER_OPTIONS,
  USAGE_INFO_TITLE,
  demographicsFieldErrors,
} from '../domain/demographics.ts'
import { resumePath } from '../domain/navigation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

export function DemographicsPage() {
  const { state, dispatch, saveNow } = useProgram()
  const navigate = useNavigate()
  const [ageError, setAgeError] = useState<string | null>(null)
  const [genderError, setGenderError] = useState<string | null>(null)

  const ageFieldError = (() => {
    if (ageError) return ageError
    if (state.ageDeclined || !state.ageInput.trim()) return null
    return parseExactAge(state.ageInput) === null ? AGE_INVALID_MESSAGE : null
  })()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const ageInput = document.getElementById('age-input')
    if (ageInput instanceof HTMLInputElement) {
      ageInput.focus()
    } else {
      document.getElementById('step-title')?.focus()
    }
  }, [])

  const goNext = () => {
    const nextErrors = demographicsFieldErrors(state)
    setAgeError(nextErrors.age)
    setGenderError(nextErrors.gender)
    if (nextErrors.age || nextErrors.gender) return
    trackLifeDesignStarted(state, () => dispatch({ type: 'MARK_USAGE_STARTED' }))
    saveNow({ usageStartedTracked: true })
    navigate(resumePath(state))
  }

  return (
    <div className="app-frame home-frame">
      <main className="sheet home-sheet">
        <StepHeading title={USAGE_INFO_TITLE}>
          <p className="privacy-note">{DEMOGRAPHICS_NOTICE}</p>
        </StepHeading>
        <section className="card demographics-card" aria-labelledby="demographics-fields-heading">
          <h2 id="demographics-fields-heading">기본정보</h2>
          <div className="field">
            <label className="field-label" htmlFor="age-input">
              만 나이
            </label>
            <input
              id="age-input"
              className="input"
              inputMode="numeric"
              autoComplete="off"
              placeholder={AGE_PLACEHOLDER}
              value={state.ageInput}
              disabled={state.ageDeclined}
              aria-invalid={ageFieldError ? true : undefined}
              aria-describedby={ageFieldError ? 'age-error' : 'age-hint'}
              onChange={(event) => {
                setAgeError(null)
                dispatch({ type: 'SET_AGE_INPUT', text: event.target.value })
              }}
            />
            <label className="check-line">
              <input
                type="checkbox"
                checked={state.ageDeclined}
                onChange={(event) => {
                  setAgeError(null)
                  dispatch({ type: 'SET_AGE_DECLINED', declined: event.target.checked })
                }}
              />
              응답하지 않음
            </label>
            <p className="field-hint" id="age-hint">
              만 18세 이상 100세 이하로 입력해 주세요.
            </p>
            {ageFieldError ? (
              <p className="field-error" id="age-error" role="alert" aria-live="assertive">
                {ageFieldError}
              </p>
            ) : null}
          </div>
          <fieldset className="check-row">
            <legend className="field-label">성별</legend>
            {GENDER_OPTIONS.map((option) => (
              <label key={option.id}>
                <input
                  type="radio"
                  name="gender"
                  checked={state.gender === option.id}
                  onChange={() => {
                    setGenderError(null)
                    dispatch({ type: 'SET_GENDER', gender: option.id })
                  }}
                />
                {option.label}
              </label>
            ))}
            {genderError ? (
              <p className="field-error" role="alert" aria-live="assertive">
                {genderError}
              </p>
            ) : null}
          </fieldset>
        </section>
        <StepNav
          backTo="/"
          backLabel="이전"
          nextLabel={DEMOGRAPHICS_NEXT_LABEL}
          onNext={goNext}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
