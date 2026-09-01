import type { ReactNode } from 'react'

interface NoticeProps {
  children: ReactNode
  tone?: 'info' | 'error'
}

export function Notice({ children, tone = 'info' }: NoticeProps) {
  return (
    <div
      className={tone === 'error' ? 'notice notice-error' : 'notice'}
      role={tone === 'error' ? 'alert' : undefined}
      aria-live={tone === 'error' ? 'assertive' : undefined}
    >
      {children}
    </div>
  )
}
