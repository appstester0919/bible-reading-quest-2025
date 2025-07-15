'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Send error to remote logging (for debugging iOS issues)
    if (typeof window !== 'undefined') {
      const errorData = {
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        componentStack: errorInfo.componentStack
      }
      
      // Log to console for development
      console.error('🚨 Error Details:', errorData)
      
      // You can also send to external logging service
      // fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorData) })
    }
    
    this.props.onError?.(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center mobile-padding">
          <div className="card-modern p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">頁面載入錯誤</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              很抱歉，此頁面在您的設備上遇到了問題。
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              重新載入
            </button>
            <div className="mt-4 text-xs text-gray-500">
              錯誤：{this.state.error?.message}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary