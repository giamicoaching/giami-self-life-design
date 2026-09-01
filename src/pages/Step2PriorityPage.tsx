import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { Notice } from '../components/ui/Notice.tsx'
import { TextArea } from '../components/ui/Field.tsx'
import { changeReviewIndex } from '../domain/calculations.ts'
import { LIFE_AREAS } from '../domain/lifeAreas.ts'
import { canProceedFromStep, stepValidationMessage } from '../domain/validation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

export function Step2PriorityPage() {
  return (
    <StepGuard stepId="step2">
      <Step2Body />
    </StepGuard>
  )
}

function Step2Body() {
  const { state, dispatch } = useProgram()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const goNext = () => {
    if (!canProceedFromStep(state, 'step2')) {
      setError(stepValidationMessage(state, 'step2'))
      return
    }
    navigate('/step/3/change')
  }

  return (
    <>
      <StepHeading kicker="2단계" title="우선 삶의 영역 선택">
        <p>
          지금 우선적으로 변화시키거나 발전시키고 싶은 영역 1개를 직접 선택해 주세요. 변화검토지수가
          가장 높은 영역을 고를 필요는 없습니다.
        </p>
      </StepHeading>
      <Notice>
        지수는 참고정보입니다. 프로그램이 우선 영역을 대신 정하지 않습니다.
      </Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <fieldset className="area-choice">
        <legend className="sr-only">우선 삶의 영역</legend>
        {LIFE_AREAS.map((area, index) => {
          const score = state.areaScores[area.id]
          const indexValue = changeReviewIndex(score)
          const selected = state.priorityAreaId === area.id
          return (
            <label key={area.id} className={selected ? 'choice-card is-selected' : 'choice-card'}>
              <input
                id={index === 0 ? 'first-field' : undefined}
                type="radio"
                name="priority-area"
                checked={selected}
                onChange={() => dispatch({ type: 'SET_PRIORITY_AREA', areaId: area.id })}
              />
              <span className="choice-body">
                <strong>{area.name}</strong>
                <span className="choice-meta">
                  중요도 {score.importance} · 만족도 {score.satisfaction} · 변화검토지수{' '}
                  {indexValue ?? '-'}점
                </span>
              </span>
            </label>
          )
        })}
      </fieldset>
      <TextArea
        id="priority-reason"
        label="이 영역을 선택한 이유"
        hint="왜 지금 이 영역을 우선하고 싶은지 자유롭게 적어 주세요."
        value={state.priorityReason}
        onChange={(event) => dispatch({ type: 'SET_PRIORITY_REASON', reason: event.target.value })}
        rows={5}
      />
      <StepNav backTo="/step/1/result" nextLabel="다음 단계" onNext={goNext} />
    </>
  )
}
