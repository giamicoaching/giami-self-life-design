import { hasCompleteDemographics, DEMOGRAPHICS_PATH } from './demographics.ts'
import { STEP_PATHS } from './steps.ts'
import type { ProgramState } from './types.ts'
import { canVisitStep, getFirstIncompleteStep } from './validation.ts'

export { DEMOGRAPHICS_PATH }

export function resumePath(state: ProgramState): string {
  if (!hasCompleteDemographics(state)) {
    return DEMOGRAPHICS_PATH
  }
  if (state.lastVisitedStep !== 'home' && canVisitStep(state, state.lastVisitedStep)) {
    return STEP_PATHS[state.lastVisitedStep]
  }
  return STEP_PATHS[getFirstIncompleteStep(state)]
}
