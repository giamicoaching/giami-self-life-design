import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { StepId } from '../../domain/types.ts'
import {
  getMissingFields,
  isValidationLocationState,
  type MissingField,
} from '../../domain/validation.ts'
import { useProgram } from '../../state/ProgramProvider.tsx'
import { focusMissingField } from './focusMissingField.ts'

type BannerState = { type: 'missing'; count: number } | { type: 'redirected'; count: number } | null

function bannerFromLocation(locationState: unknown, missing: MissingField[]): BannerState {
  if (!isValidationLocationState(locationState) || missing.length === 0) return null
  return locationState.fromIncompleteStep
    ? { type: 'redirected', count: missing.length }
    : { type: 'missing', count: missing.length }
}

export function useMissingResponses(stepId: StepId) {
  const { state } = useProgram()
  const location = useLocation()
  const missing = getMissingFields(state, stepId)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() =>
    isValidationLocationState(location.state)
      ? new Set(getMissingFields(state, stepId).map((field) => field.id))
      : new Set(),
  )
  const [banner, setBanner] = useState<BannerState>(() =>
    bannerFromLocation(location.state, getMissingFields(state, stepId)),
  )
  const [focusNonce, setFocusNonce] = useState(0)
  const pendingFocus = useRef<MissingField | null>(null)
  const focusedLocationKey = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!isValidationLocationState(location.state)) return
    if (focusedLocationKey.current === location.key) return
    focusedLocationKey.current = location.key
    const first = getMissingFields(state, stepId)[0]
    if (first) focusMissingField(first)
  }, [location.key, location.state, state, stepId])

  useLayoutEffect(() => {
    const field = pendingFocus.current
    if (!field) return
    pendingFocus.current = null
    focusMissingField(field)
  }, [focusNonce])

  const errorFor = (id: string): string | undefined => {
    if (!revealedIds.has(id)) return undefined
    return missing.find((field) => field.id === id)?.message
  }

  const validate = (): boolean => {
    const current = getMissingFields(state, stepId)
    if (current.length === 0) {
      pendingFocus.current = null
      setBanner(null)
      setRevealedIds(new Set())
      return true
    }
    pendingFocus.current = current[0] ?? null
    setRevealedIds(new Set(current.map((field) => field.id)))
    setBanner({ type: 'missing', count: current.length })
    setFocusNonce((value) => value + 1)
    return false
  }

  return {
    banner,
    errorFor,
    validate,
  }
}
