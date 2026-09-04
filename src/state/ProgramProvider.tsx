import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { createInitialState } from '../domain/initialState.ts'
import { resetUsageEventLocks } from '../analytics/usage.ts'
import type { ProgramState, StepId } from '../domain/types.ts'
import {
  clearProgramState,
  loadProgramState,
  saveProgramState,
  type StorageAdapter,
} from '../storage/storage.ts'
import { programReducer, type ProgramAction } from './programReducer.ts'

const SAVE_DELAY_MS = 400

interface ProgramContextValue {
  state: ProgramState
  dispatch: (action: ProgramAction) => void
  saveNow: (patch?: Partial<ProgramState>) => void
  resetAll: () => void
  markVisited: (step: StepId) => void
}

const ProgramContext = createContext<ProgramContextValue | null>(null)

interface ProviderProps {
  children: ReactNode
  storage?: StorageAdapter
}

export function ProgramProvider({ children, storage = localStorage }: ProviderProps) {
  const [state, dispatch] = useReducer(
    programReducer,
    undefined,
    () => loadProgramState(storage) ?? createInitialState(),
  )

  const persist = useCallback(
    (next: ProgramState) => {
      saveProgramState(next, storage)
    },
    [storage],
  )

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const timer = window.setTimeout(() => persist(state), SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [state, persist])

  useEffect(() => {
    const flush = () => persist(stateRef.current)
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onHide)
      flush()
    }
  }, [persist])

  const saveNow = useCallback(
    (patch?: Partial<ProgramState>) => {
      const latest = patch ? { ...state, ...patch } : state
      stateRef.current = latest
      persist(latest)
    },
    [persist, state],
  )

  const resetAll = useCallback(() => {
    const initial = createInitialState()
    stateRef.current = initial
    dispatch({ type: 'RESET' })
    resetUsageEventLocks()
    clearProgramState(storage)
  }, [storage])

  const hydrateLegacyFlags = useCallback(() => {
    const current = stateRef.current
    const hasScores = Object.values(current.areaScores).some(
      (score) => score.importance !== null || score.satisfaction !== null,
    )
    if (hasScores && !current.usageStartedTracked) {
      dispatch({ type: 'MARK_USAGE_STARTED' })
    }
    if (current.programCompleted && !current.usageCompletedTracked) {
      dispatch({ type: 'MARK_USAGE_COMPLETED' })
    }
  }, [])

  useEffect(() => {
    hydrateLegacyFlags()
  }, [hydrateLegacyFlags])

  const markVisited = useCallback((step: StepId) => {
    dispatch({ type: 'SET_LAST_VISITED', step })
  }, [])

  const value = useMemo(
    () => ({ state, dispatch, saveNow, resetAll, markVisited }),
    [state, saveNow, resetAll, markVisited],
  )

  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>
}

export function useProgram(): ProgramContextValue {
  const value = useContext(ProgramContext)
  if (!value) {
    throw new Error('useProgram must be used within ProgramProvider')
  }
  return value
}
