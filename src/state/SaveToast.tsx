import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useProgram } from './ProgramProvider.tsx'
import { trackResultSaved } from '../analytics/usage.ts'

export const SAVE_TOAST_MESSAGE = '결과가 저장되었습니다.'
export const SAVE_TOAST_DURATION_MS = 3000

interface SaveToastContextValue {
  saveResult: () => void
}

const SaveToastContext = createContext<SaveToastContextValue | null>(null)

export function SaveToastProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, saveNow } = useProgram()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<number | null>(null)

  const saveResult = useCallback(() => {
    saveNow()
    trackResultSaved(state, () => {
      dispatch({ type: 'MARK_USAGE_SAVED' })
      saveNow({ usageSavedTracked: true })
    })
    setVisible(true)
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      setVisible(false)
      timerRef.current = null
    }, SAVE_TOAST_DURATION_MS)
  }, [dispatch, saveNow, state])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const value = useMemo(() => ({ saveResult }), [saveResult])

  return (
    <SaveToastContext.Provider value={value}>
      {children}
      <div
        className={visible ? 'save-toast no-print' : 'save-toast save-toast-idle no-print'}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-hidden={visible ? undefined : true}
      >
        {visible ? SAVE_TOAST_MESSAGE : ''}
      </div>
    </SaveToastContext.Provider>
  )
}

export function useSaveResult(): () => void {
  const value = useContext(SaveToastContext)
  if (!value) {
    throw new Error('useSaveResult must be used within SaveToastProvider')
  }
  return value.saveResult
}
