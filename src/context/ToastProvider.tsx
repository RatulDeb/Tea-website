import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import { ToastContext, type ToastAction } from './ToastContext'

interface ToastState {
  key: number
  message: string
  action?: ToastAction
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, action?: ToastAction) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setToast({ key: Date.now(), message, action })
    timeoutRef.current = window.setTimeout(() => {
      setToast(null)
      timeoutRef.current = null
    }, 3800)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast ? (
          <div className="toast" key={toast.key} role="status">
            <CheckCircle2 className="toast-icon" aria-hidden="true" />
            <p>{toast.message}</p>
            {toast.action ? (
              <Link className="toast-action" to={toast.action.to} onClick={dismiss}>
                {toast.action.label}
              </Link>
            ) : null}
            <button
              type="button"
              className="toast-close"
              onClick={dismiss}
              aria-label="Dismiss notification"
            >
              <X aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  )
}
