import { ConfirmDialog } from './ui/ConfirmDialog.tsx'
import {
  RESET_CANCEL_LABEL,
  RESET_CONFIRM_DESCRIPTION,
  RESET_CONFIRM_LABEL,
  RESET_CONFIRM_TITLE,
} from '../state/useStartOver.ts'

interface ResetConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ResetConfirmDialog({ open, onCancel, onConfirm }: ResetConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={RESET_CONFIRM_TITLE}
      description={RESET_CONFIRM_DESCRIPTION}
      confirmLabel={RESET_CONFIRM_LABEL}
      cancelLabel={RESET_CANCEL_LABEL}
      danger
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
