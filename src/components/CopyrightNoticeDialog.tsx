import { useEffect, useRef } from 'react'
import {
  COACHING_CENTER_URL,
  COPYRIGHT_AUTHOR_NAME,
  COPYRIGHT_AUTHOR_ORG,
  COPYRIGHT_CLOSE_LABEL,
  COPYRIGHT_NOTICE_PARAGRAPHS,
  COPYRIGHT_NOTICE_TITLE,
} from '../copy/programCopy.ts'

interface CopyrightNoticeDialogProps {
  open: boolean
  onClose: () => void
}

export function CopyrightNoticeDialog({ open, onClose }: CopyrightNoticeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="dialog copyright-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-labelledby="copyright-title"
    >
      <div className="copyright-dialog-panel">
        <h2 id="copyright-title">{COPYRIGHT_NOTICE_TITLE}</h2>
        <div className="copyright-dialog-body">
          {COPYRIGHT_NOTICE_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="copyright-author">
            {COPYRIGHT_AUTHOR_NAME} | {COPYRIGHT_AUTHOR_ORG} |{' '}
            <a href={COACHING_CENTER_URL} target="_blank" rel="noopener noreferrer">
              {COACHING_CENTER_URL}
            </a>
          </p>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {COPYRIGHT_CLOSE_LABEL}
          </button>
        </div>
      </div>
    </dialog>
  )
}
