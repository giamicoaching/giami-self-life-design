import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { Chip } from '../components/ui/Chip.tsx'
import { TextArea } from '../components/ui/Field.tsx'
import { Notice } from '../components/ui/Notice.tsx'
import { getLifeArea } from '../domain/lifeAreas.ts'
import type { StepId } from '../domain/types.ts'
import { CORE_VALUES, getCoreValue } from '../domain/values.ts'
import { changeIdeaPlaceholder, refineChangeExample } from '../domain/examples.ts'
import { canProceedFromStep, stepValidationMessage } from '../domain/validation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

const SUB_STEPS = {
  change: 'step3-change',
  candidates: 'step3-candidates',
  core: 'step3-core',
  refine: 'step3-refine',
} as const

type SubKey = keyof typeof SUB_STEPS

export function Step3Page() {
  const { sub } = useParams()
  if (sub !== 'change' && sub !== 'candidates' && sub !== 'core' && sub !== 'refine') {
    return <Navigate to="/step/3/change" replace />
  }
  const stepId = SUB_STEPS[sub]
  return (
    <StepGuard stepId={stepId}>
      <Step3Body sub={sub} stepId={stepId} />
    </StepGuard>
  )
}

function Step3Body({ sub, stepId }: { sub: SubKey; stepId: StepId }) {
  const { state, dispatch } = useProgram()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const areaName = state.priorityAreaId ? getLifeArea(state.priorityAreaId).name : '선택 영역'

  const goNext = () => {
    if (!canProceedFromStep(state, stepId)) {
      setError(stepValidationMessage(state, stepId))
      return
    }
    setError(null)
    if (sub === 'change') navigate('/step/3/candidates')
    if (sub === 'candidates') navigate('/step/3/core')
    if (sub === 'core') navigate('/step/3/refine')
    if (sub === 'refine') navigate('/step/4')
  }

  return (
    <>
      <StepHeading kicker="3단계" title="원하는 변화와 핵심 가치">
        {sub === 'core' ? (
          <p>
            앞에서 선택한 가치 후보 5개 중, 이번 변화를 이끌 가장 중요한 핵심 가치 2개를 선택해
            주세요.
          </p>
        ) : sub === 'candidates' ? (
          <>
            <p>
              앞에서 작성한 변화를 어떤 방향으로 이루고 싶은지 생각해 보세요. 여기서 가치는 목표
              자체가 아니라 선택과 행동의 방향을 정하는 기준입니다. 18개 가치의 정의를 천천히 읽고,
              이번 변화를 이루는 과정에서 특히 중요하게 지키거나 추구하고 싶은 가치 5개를 선택해
              주세요. 지금 순위를 정할 필요는 없으며, 다음 화면에서 5개 중 핵심 가치 2개를 다시
              선택하게 됩니다.
            </p>
            <p>
              정확히 5개를 선택해 주세요. 선택한 가치는 다음 단계에서 다시 변경할 수 있습니다.
            </p>
          </>
        ) : sub === 'refine' ? (
          <p>선택한 두 가치가 드러나도록 원하는 변화를 다시 구체화해 주세요.</p>
        ) : (
          <p>
            선택 영역에서 지금보다 달라지기를 바라는 점을 적어 주세요. 점수로 가치를 매기지
            않습니다.
          </p>
        )}
      </StepHeading>
      {error ? <Notice tone="error">{error}</Notice> : null}

      {sub === 'change' ? (
        <>
          <TextArea
            id="first-field"
            label={`‘${areaName}’에서 지금보다 무엇이 달라지기를 바라나요?`}
            hint="더 늘리거나 발전시키고 싶은 것, 새롭게 시작하고 싶은 것, 줄이거나 그만두고 싶은 것, 잘하고 있어서 유지하고 싶은 것을 단서로 삼아 보세요."
            placeholder={changeIdeaPlaceholder(state.priorityAreaId)}
            value={state.changeIdeas}
            onChange={(event) => dispatch({ type: 'SET_CHANGE_IDEAS', text: event.target.value })}
            rows={7}
          />
          <StepNav backTo="/step/2" nextLabel="가치 후보 고르기" onNext={goNext} />
        </>
      ) : null}

      {sub === 'candidates' ? (
        <>
          <fieldset className="chip-fieldset">
            <legend className="count-line">
              가치 후보 <strong>{state.candidateValueIds.length}/5개 선택</strong>
            </legend>
            <div className="chip-grid" id="first-field" tabIndex={-1}>
              {CORE_VALUES.map((value) => {
                const selected = state.candidateValueIds.includes(value.id)
                const locked = !selected && state.candidateValueIds.length >= 5
                return (
                  <Chip
                    key={value.id}
                    selected={selected}
                    disabled={locked}
                    title={value.definition}
                    onToggle={() => dispatch({ type: 'TOGGLE_CANDIDATE_VALUE', valueId: value.id })}
                  >
                    {value.name}
                  </Chip>
                )
              })}
            </div>
          </fieldset>
          <ul className="value-defs">
            {CORE_VALUES.map((value) => (
              <li key={value.id}>
                <strong>{value.name}</strong> {value.definition}
              </li>
            ))}
          </ul>
          <StepNav backTo="/step/3/change" nextLabel="핵심 가치 고르기" onNext={goNext} />
        </>
      ) : null}

      {sub === 'core' ? (
        <>
          <fieldset className="chip-fieldset">
            <legend className="count-line">
              핵심 가치 <strong>{state.coreValueIds.length} / 2</strong>
            </legend>
            <div className="chip-grid" id="first-field" tabIndex={-1}>
              {state.candidateValueIds.map((id) => {
                const value = getCoreValue(id)
                const selected = state.coreValueIds.includes(id)
                const locked = !selected && state.coreValueIds.length >= 2
                return (
                  <Chip
                    key={id}
                    selected={selected}
                    disabled={locked}
                    title={value.definition}
                    onToggle={() => dispatch({ type: 'TOGGLE_CORE_VALUE', valueId: id })}
                  >
                    {value.name}
                  </Chip>
                )
              })}
            </div>
          </fieldset>
          <ul className="value-defs">
            {state.candidateValueIds.map((id) => {
              const value = getCoreValue(id)
              return (
                <li key={id}>
                  <strong>{value.name}</strong> {value.definition}
                </li>
              )
            })}
          </ul>
          <StepNav backTo="/step/3/candidates" nextLabel="변화 구체화하기" onNext={goNext} />
        </>
      ) : null}

      {sub === 'refine' ? (
        <>
          <article className="card">
            <h2>처음 작성한 변화</h2>
            <p className="preserve">{state.changeIdeas}</p>
            <h2>핵심 가치 2개</h2>
            <ul className="value-defs">
              {state.coreValueIds.map((id) => {
                const value = getCoreValue(id)
                return (
                  <li key={id}>
                    <strong>{value.name}</strong> {value.definition}
                  </li>
                )
              })}
            </ul>
          </article>
          <TextArea
            id="first-field"
            label="두 가치가 반영되도록 원하는 변화를 다시 구체화해 주세요"
            hint={refineChangeExample(state.coreValueIds.map((id) => getCoreValue(id).name))}
            placeholder={refineChangeExample(state.coreValueIds.map((id) => getCoreValue(id).name))}
            value={state.refinedChange}
            onChange={(event) => dispatch({ type: 'SET_REFINED_CHANGE', text: event.target.value })}
            rows={7}
          />
          <StepNav backTo="/step/3/core" nextLabel="목표 수립으로" onNext={goNext} />
        </>
      ) : null}
    </>
  )
}
