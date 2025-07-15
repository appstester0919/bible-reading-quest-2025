'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'md': return 'w-8 h-8'
      case 'lg': return 'w-12 h-12'
      default: return 'w-8 h-8'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'primary': return 'border-indigo-600 border-t-transparent'
      case 'white': return 'border-white border-t-transparent'
      case 'gray': return 'border-gray-600 border-t-transparent'
      default: return 'border-indigo-600 border-t-transparent'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm'
      case 'md': return 'text-base'
      case 'lg': return 'text-lg'
      default: return 'text-base'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`
          ${getSizeClasses()} 
          ${getColorClasses()}
          border-2 border-solid rounded-full animate-spin
        `}
        role="status"
        aria-label="載入中"
      />
      {text && (
        <p className={`${getTextSize()} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
      <span className="sr-only">載入中...</span>
    </div>
  )
}

// 全屏載入組件
export function FullScreenLoader({ text = "載入中..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// 頁面載入組件
export function PageLoader({ text = "載入中..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center mobile-padding">
      <div className="card-modern p-8 text-center max-w-md w-full">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}

// 按鈕載入組件
export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return <LoadingSpinner size={size} color="white" />
}

// 內聯載入組件
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}