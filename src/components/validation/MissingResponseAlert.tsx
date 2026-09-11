import {
  INCOMPLETE_STEP_BANNER,
  MISSING_RESPONSE_LABEL,
  missingResponseBanner,
} from '../../domain/validation.ts'

interface MissingResponseAlertProps {
  count?: number
  redirected?: boolean
}

export function MissingResponseAlert({ count = 0, redirected = false }: MissingResponseAlertProps) {
  if (!redirected && count < 1) return null
  const message = redirected ? INCOMPLETE_STEP_BANNER : missingResponseBanner(count)

  return (
    <div className="notice notice-error missing-response-alert" role="alert" aria-live="assertive">
      <span className="missing-response-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
          <path
            fill="currentColor"
            d="M12 3.2 2.4 20.2h19.2L12 3.2zm0 5.3c.6 0 1 .5 1 1.1v4.2c0 .6-.4 1.1-1 1.1s-1-.5-1-1.1V9.6c0-.6.4-1.1 1-1.1zm0 8.1c.7 0 1.2.5 1.2 1.2S12.7 19 12 19s-1.2-.5-1.2-1.2.5-1.2 1.2-1.2z"
          />
        </svg>
      </span>
      <div className="missing-response-copy">
        <p className="missing-response-label">{MISSING_RESPONSE_LABEL}</p>
        <p className="missing-response-message">{message}</p>
      </div>
    </div>
  )
}
