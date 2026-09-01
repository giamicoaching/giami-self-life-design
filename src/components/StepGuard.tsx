import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { STEP_PATHS } from '../domain/steps.ts'
import type { StepId } from '../domain/types.ts'
import { canVisitStep, getFirstIncompleteStep } from '../domain/validation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

export function StepGuard({ stepId, children }: { stepId: StepId; children: ReactNode }) {
  const { state } = useProgram()

  if (!canVisitStep(state, stepId)) {
    return <Navigate to={STEP_PATHS[getFirstIncompleteStep(state)]} replace />
  }

  return children
}
