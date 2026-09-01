import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { Chip } from '../components/ui/Chip.tsx'
import { TextArea, TextField } from '../components/ui/Field.tsx'
import { Notice } from '../components/ui/Notice.tsx'
import { Scale } from '../components/ui/Scale.tsx'
import { getLifeArea } from '../domain/lifeAreas.ts'
import { SELF_CHECK_ITEMS } from '../domain/selfChecks.ts'
import { getCoreValue } from '../domain/values.ts'
import { GOAL_CRITERIA_PLACEHOLDER, GOAL_PERIOD_PLACEHOLDER } from '../domain/examples.ts'
import { canProceedFromStep, isInsufficientGoal, stepValidationMessage } from '../domain/validation.ts'
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
  const [error, setError] = useState<string | null>(null)
  const areaName = state.priorityAreaId ? getLifeArea(state.priorityAreaId).name : ''
  const goalError = isInsufficientGoal(state.goal)
    ? '빈칸이거나 ‘모르겠음·모름·잘 모르겠음’만 있으면 다음으로 갈 수 없습니다.'
    : undefined

  const goNext = () => {
    if (!canProceedFromStep(state, 'step4')) {
      setError(stepValidationMessage(state, 'step4'))
      return
    }
    navigate('/step/5')
  }

  return (
    <>
      <StepHeading kicker="4단계" title="목표 수립">
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
      {error ? <Notice tone="error">{error}</Notice> : null}
      <fieldset className="chip-fieldset">
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
      </fieldset>
      <TextArea
        id="goal"
        label="나의 목표"
        hint="5단계 행동계획의 출발점이므로 반드시 구체적으로 작성해 주세요."
        error={state.goal.trim() && goalError ? goalError : undefined}
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
        onChange={(value) => dispatch({ type: 'SET_GOAL_FEASIBILITY', value })}
        lowLabel="낮음"
        highLabel="높음"
      />
      <section className="card">
        <h2>자기점검</h2>
        <p className="muted">점검 내용은 참고용입니다. 예 또는 아직 보완이 필요함으로 표시할 수 있습니다.</p>
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
