import { useEffect, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getMainStageByStep, getStepProgress, pathToStepId } from '../../domain/steps.ts'
import { useProgram } from '../../state/ProgramProvider.tsx'
import { ProgressHeader } from './ProgressHeader.tsx'

export function ProgramShell() {
  const location = useLocation()
  const { markVisited } = useProgram()
  const stepId = pathToStepId(location.pathname)
  const stage = getMainStageByStep(stepId)
  const progress = getStepProgress(stepId)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const firstField = document.getElementById('first-field')
    if (
      firstField instanceof HTMLInputElement ||
      firstField instanceof HTMLTextAreaElement ||
      firstField instanceof HTMLSelectElement
    ) {
      firstField.focus()
    } else {
      document.getElementById('step-title')?.focus()
    }
    markVisited(stepId)
  }, [location.pathname, markVisited, stepId])

  return (
    <div className="app-frame">
      <ProgressHeader
        stageLabel={stage?.label ?? '지아미 자기주도 생애설계'}
        stageNumber={progress.current}
        total={progress.total}
        percent={progress.percent}
      />
      <main className="sheet">
        <Outlet />
      </main>
    </div>
  )
}

interface StepNavProps {
  backTo?: string
  backLabel?: string
  nextLabel?: string
  onNext?: () => void
  error?: string | null
}

export function StepNav({
  backTo,
  backLabel = '이전',
  nextLabel = '다음 단계',
  onNext,
  error,
}: StepNavProps) {
  const navigate = useNavigate()

  return (
    <div className="step-nav no-print">
      {error ? <p className="nav-error">{error}</p> : null}
      <div className="step-nav-row">
        {backTo ? (
          <button type="button" className="btn btn-ghost" onClick={() => navigate(backTo)}>
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        {onNext ? (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            {nextLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function StepHeading({
  kicker,
  title,
  children,
}: {
  kicker?: string
  title: string
  children?: ReactNode
}) {
  return (
    <header className="step-heading">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h1 id="step-title" tabIndex={-1}>
        {title}
      </h1>
      {children}
    </header>
  )
}
