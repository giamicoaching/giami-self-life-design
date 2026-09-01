import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { Notice } from '../components/ui/Notice.tsx'
import { Scale } from '../components/ui/Scale.tsx'
import { AREA_PAGES, getLifeArea } from '../domain/lifeAreas.ts'
import type { StepId } from '../domain/types.ts'
import { canProceedFromStep, stepValidationMessage } from '../domain/validation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

const PAGE_STEPS: StepId[] = ['step1-1', 'step1-2', 'step1-3']

export function Step1AreasPage() {
  const { screen } = useParams()
  const page = Number(screen)
  if (page !== 1 && page !== 2 && page !== 3) {
    return <Navigate to="/step/1/1" replace />
  }
  const stepId = PAGE_STEPS[page - 1]
  if (!stepId) return null
  return (
    <StepGuard stepId={stepId}>
      <Step1AreasBody page={page} stepId={stepId} />
    </StepGuard>
  )
}

function Step1AreasBody({ page, stepId }: { page: 1 | 2 | 3; stepId: StepId }) {
  const { state, dispatch } = useProgram()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const areaIds = AREA_PAGES[page - 1] ?? []
  const areas = areaIds.map(getLifeArea)

  const goNext = () => {
    if (!canProceedFromStep(state, stepId)) {
      setError(stepValidationMessage(state, stepId))
      return
    }
    setError(null)
    if (page < 3) navigate(`/step/1/${page + 1}`)
    else navigate('/step/1/result')
  }

  return (
    <>
      <StepHeading kicker={`1단계 · ${page}/3화면`} title="삶의 영역 평가">
        <p>
          각 영역에서 나에게 중요한 정도와 현재 만족하는 정도를 1부터 7까지 표시해 주세요. 정답이
          있는 검사가 아닙니다.
        </p>
      </StepHeading>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="stack">
        {areas.map((area, index) => {
          const score = state.areaScores[area.id]
          return (
            <article key={area.id} className="card">
              <h2>{area.name}</h2>
              <p>{area.definition}</p>
              {area.note ? <Notice>{area.note}</Notice> : null}
              <Scale
                id={`${area.id}-importance`}
                name={`${area.id}-importance`}
                label={`${area.name} 중요도`}
                value={score.importance}
                onChange={(value) =>
                  dispatch({
                    type: 'SET_AREA_SCORE',
                    areaId: area.id,
                    field: 'importance',
                    value,
                  })
                }
                lowLabel="덜 중요"
                highLabel="매우 중요"
              />
              <Scale
                id={`${area.id}-satisfaction`}
                name={`${area.id}-satisfaction`}
                label={`${area.name} 만족도`}
                value={score.satisfaction}
                onChange={(value) =>
                  dispatch({
                    type: 'SET_AREA_SCORE',
                    areaId: area.id,
                    field: 'satisfaction',
                    value,
                  })
                }
                lowLabel="불만족"
                highLabel="매우 만족"
              />
              {index === 0 ? <span id="first-field" tabIndex={-1} className="sr-only" /> : null}
            </article>
          )
        })}
      </div>
      <StepNav
        backTo={page === 1 ? '/' : `/step/1/${page - 1}`}
        backLabel={page === 1 ? '처음으로' : '이전 화면'}
        nextLabel={page === 3 ? '결과 보기' : '다음 화면'}
        onNext={goNext}
      />
    </>
  )
}
