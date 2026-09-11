import { useNavigate } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { Chip } from '../components/ui/Chip.tsx'
import { TextArea, TextField } from '../components/ui/Field.tsx'
import { Scale } from '../components/ui/Scale.tsx'
import { MissingResponseAlert } from '../components/validation/MissingResponseAlert.tsx'
import { QuestionBlock } from '../components/validation/QuestionBlock.tsx'
import { useMissingResponses } from '../components/validation/useMissingResponses.ts'
import { OPTIONAL_FIELD_MARK } from '../copy/programCopy.ts'
import { getLifeArea } from '../domain/lifeAreas.ts'
import { SELF_CHECK_ITEMS } from '../domain/selfChecks.ts'
import { STEP_PATHS } from '../domain/steps.ts'
import { getCoreValue } from '../domain/values.ts'
import { GOAL_CRITERIA_PLACEHOLDER, GOAL_PERIOD_PLACEHOLDER } from '../domain/examples.ts'
import {
  firstIncompleteStepBefore,
  incompleteStepLocationState,
  isInsufficientGoal,
} from '../domain/validation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

export function Step4GoalPage() {
  return (
    <StepGuard stepId="step4">
      <Step4Body />
    </StepGuard>
  )
}

function Step4Body() {
  const { state, dispatch } = useProgram()
  const navigate = useNavigate()
  const { banner, errorFor, validate } = useMissingResponses('step4')
  const areaName = state.priorityAreaId ? getLifeArea(state.priorityAreaId).name : ''
  const valueError = errorFor('goal-values')
  const liveGoalError =
    state.goal.trim() && isInsufficientGoal(state.goal)
      ? '빈칸이거나 ‘모르겠음·모름·잘 모르겠음’만 있으면 다음으로 갈 수 없습니다.'
      : undefined
  const goalError = liveGoalError ?? errorFor('goal')

  const goNext = () => {
    const previous = firstIncompleteStepBefore(state, 'step4')
    if (previous) {
      navigate(STEP_PATHS[previous], { state: incompleteStepLocationState() })
      return
    }
    if (!validate()) return
    navigate('/step/5')
  }

  return (
    <>
      <StepHeading kicker="4단계" title="나의 목표">
        <p>목표는 직접 작성합니다. 프로그램이 문장을 만들거나 입력을 보완하지 않습니다.</p>
      </StepHeading>
      <article className="card summary-card">
        <p>
          <strong>선택 영역</strong> {areaName}
        </p>
        <p>
          <strong>핵심 가치</strong>{' '}
          {state.coreValueIds.map((id) => getCoreValue(id).name).join(', ')}
        </p>
        <p className="preserve">
          <strong>가치가 반영된 변화</strong>
          {'\n'}
          {state.refinedChange}
        </p>
      </article>
      {banner ? (
        <MissingResponseAlert redirected={banner.type === 'redirected'} count={banner.count} />
      ) : null}
      <QuestionBlock
        id="question-goal-values"
        error={valueError}
        className="chip-fieldset"
        as="fieldset"
        tabIndex={-1}
      >
        <legend className="count-line">목표에 반영할 가치 (1개 또는 2개)</legend>
        <div className="chip-grid" id="first-field" tabIndex={-1}>
          {state.coreValueIds.map((id) => {
            const value = getCoreValue(id)
            const selected = state.goalValueIds.includes(id)
            const locked = !selected && state.goalValueIds.length >= 2
            return (
              <Chip
                key={id}
                selected={selected}
                disabled={locked}
                title={value.definition}
                onToggle={() => dispatch({ type: 'TOGGLE_GOAL_VALUE', valueId: id })}
              >
                {value.name}
              </Chip>
            )
          })}
        </div>
      </QuestionBlock>
      <TextArea
        id="goal"
        questionId="question-goal"
        label="나의 목표"
        hint="5단계 행동계획의 출발점이므로 반드시 구체적으로 작성해 주세요."
        error={goalError}
        value={state.goal}
        onChange={(event) => dispatch({ type: 'SET_GOAL', text: event.target.value })}
        rows={5}
      />
      <div className="examples">
        <h2>목표 예시</h2>
        <ul>
          <li>앞으로 3개월 동안 월 2회 지역 청년을 위한 무료 진로상담에 참여한다.</li>
          <li>매주 한 번 내가 가진 전문지식을 나누는 짧은 글을 작성한다.</li>
        </ul>
      </div>
      <TextField
        id="goal-period"
        label="목표 기간"
        hint="답하기 어렵다면 ‘모르겠음’이라고 적어도 됩니다."
        placeholder={GOAL_PERIOD_PLACEHOLDER}
        optional
        value={state.goalPeriod}
        onChange={(event) => dispatch({ type: 'SET_GOAL_PERIOD', text: event.target.value })}
      />
      <TextArea
        id="goal-criteria"
        label="목표 달성 확인 기준"
        hint="무엇을 보면 목표에 다가갔는지 알 수 있나요? 어렵다면 ‘모르겠음’도 가능합니다."
        placeholder={GOAL_CRITERIA_PLACEHOLDER}
        optional
        value={state.goalCriteria}
        onChange={(event) => dispatch({ type: 'SET_GOAL_CRITERIA', text: event.target.value })}
        rows={3}
      />
      <Scale
        id="goal-feasibility"
        name="goal-feasibility"
        label="목표 실현 가능성"
        value={state.goalFeasibility}
        error={errorFor('goal-feasibility')}
        onChange={(value) => dispatch({ type: 'SET_GOAL_FEASIBILITY', value })}
        lowLabel="낮음"
        highLabel="높음"
      />
      <section className="card">
        <h2>
          자기점검 <span className="field-optional">{OPTIONAL_FIELD_MARK}</span>
        </h2>
        <p className="muted">점검 내용은 참고정보입니다. 예 또는 아직 보완이 필요함으로 표시할 수 있습니다.</p>
        {SELF_CHECK_ITEMS.map((item) => (
          <fieldset key={item.key} className="check-row">
            <legend>{item.label}</legend>
            <label>
              <input
                type="radio"
                name={item.key}
                checked={state.selfChecks[item.key] === true}
                onChange={() => dispatch({ type: 'SET_SELF_CHECK', key: item.key, value: true })}
              />
              예
            </label>
            <label>
              <input
                type="radio"
                name={item.key}
                checked={state.selfChecks[item.key] === false}
                onChange={() => dispatch({ type: 'SET_SELF_CHECK', key: item.key, value: false })}
              />
              아직 보완이 필요함
            </label>
          </fieldset>
        ))}
      </section>
      <StepNav backTo="/step/3/refine" nextLabel="행동계획으로" onNext={goNext} />
    </>
  )
}
