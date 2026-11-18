import { createContext } from 'react'

export interface ToastAction {
  label: string
  to: string
}

export interface ToastContextValue {
  showToast: (message: string, action?: ToastAction) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
