import { useNavigate } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { Notice } from '../components/ui/Notice.tsx'
import { TextArea } from '../components/ui/Field.tsx'
import { MissingResponseAlert } from '../components/validation/MissingResponseAlert.tsx'
import { QuestionBlock } from '../components/validation/QuestionBlock.tsx'
import { useMissingResponses } from '../components/validation/useMissingResponses.ts'
import { changeReviewIndex } from '../domain/calculations.ts'
import { LIFE_AREAS } from '../domain/lifeAreas.ts'
import { STEP_PATHS } from '../domain/steps.ts'
import {
  firstIncompleteStepBefore,
  incompleteStepLocationState,
} from '../domain/validation.ts'
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
  const { banner, errorFor, validate } = useMissingResponses('step2')
  const areaError = errorFor('priority-area')
  const reasonError = errorFor('priority-reason')

  const goNext = () => {
    const previous = firstIncompleteStepBefore(state, 'step2')
    if (previous) {
      navigate(STEP_PATHS[previous], { state: incompleteStepLocationState() })
      return
    }
    if (!validate()) return
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
        변화검토지수는 참고정보입니다. 가장 높은 영역을 반드시 선택할 필요는 없으며, 프로그램이
        우선 삶의 영역을 자동으로 결정하지 않습니다. 현재 필요성·의미·변화 가능성을 고려하여 직접
        선택해 주세요.
      </Notice>
      {banner ? (
        <MissingResponseAlert redirected={banner.type === 'redirected'} count={banner.count} />
      ) : null}
      <QuestionBlock id="question-priority-area" error={areaError} className="area-choice" as="fieldset" tabIndex={-1}>
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
      </QuestionBlock>
      <TextArea
        id="priority-reason"
        questionId="question-priority-reason"
        label="이 영역을 선택한 이유"
        hint="왜 지금 이 영역을 우선하고 싶은지 자유롭게 적어 주세요."
        error={reasonError}
        value={state.priorityReason}
        onChange={(event) => dispatch({ type: 'SET_PRIORITY_REASON', reason: event.target.value })}
        rows={5}
      />
      <StepNav backTo="/step/1/result" nextLabel="다음 단계" onNext={goNext} />
    </>
  )
}
