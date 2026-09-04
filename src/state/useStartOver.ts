import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEMOGRAPHICS_PATH } from '../domain/demographics.ts'
import { useProgram } from './ProgramProvider.tsx'

export const RESET_CONFIRM_TITLE = '처음부터 다시 시작하시겠습니까?'
export const RESET_CONFIRM_DESCRIPTION =
  '지금까지 저장한 응답이 모두 삭제됩니다. 처음부터 다시 시작하시겠습니까?'
export const RESET_CONFIRM_LABEL = '삭제하고 새로 시작'
export const RESET_CANCEL_LABEL = '취소'
export const START_OVER_PATH = DEMOGRAPHICS_PATH

export function useStartOver() {
  const { resetAll } = useProgram()
  const navigate = useNavigate()

  return useCallback(() => {
    resetAll()
    navigate(START_OVER_PATH, { replace: true })
  }, [navigate, resetAll])
}
