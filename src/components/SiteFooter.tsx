import { useRef, useState } from 'react'
import { COPYRIGHT_LINE, COPYRIGHT_NOTICE_LINK } from '../copy/programCopy.ts'
import { CopyrightNoticeDialog } from './CopyrightNoticeDialog.tsx'

export function SiteFooter() {
  const [open, setOpen] = useState(false)
  const linkRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    setOpen(false)
    window.requestAnimationFrame(() => {
      linkRef.current?.focus()
    })
  }

  return (
    <>
      <footer className="site-footer no-print">
        <p>{COPYRIGHT_LINE}</p>
        <button
          ref={linkRef}
          type="button"
          className="site-footer-link"
          onClick={() => setOpen(true)}
        >
          {COPYRIGHT_NOTICE_LINK}
        </button>
      </footer>
      <CopyrightNoticeDialog open={open} onClose={close} />
    </>
  )
}
