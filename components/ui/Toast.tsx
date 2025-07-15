'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // 自動移除 toast
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 5000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const getToastStyles = () => {
    const baseStyles = "p-4 rounded-lg shadow-lg border-l-4 bg-white transform transition-all duration-300 ease-in-out"
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50`
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50`
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50`
      case 'info':
        return `${baseStyles} border-blue-500 bg-blue-50`
      default:
        return `${baseStyles} border-gray-500`
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case 'success': return 'text-green-800'
      case 'error': return 'text-red-800'
      case 'warning': return 'text-yellow-800'
      case 'info': return 'text-blue-800'
      default: return 'text-gray-800'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            <h4 className={`font-semibold ${getTextColor()}`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
                {toast.message}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className={`ml-4 ${getTextColor()} hover:opacity-70 transition-opacity`}
          aria-label="關閉通知"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    success: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'info', title, message, duration }),
  }
}