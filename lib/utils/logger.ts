// 條件化日誌工具
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    // 錯誤日誌在生產環境也要記錄，但可以發送到日誌服務
    console.error(...args)
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args)
    }
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args)
    }
  }
}

// 生產環境錯誤報告（可以集成 Sentry 等服務）
export const reportError = (error: Error, context?: string) => {
  if (isProd) {
    // 在生產環境中，可以發送到錯誤追蹤服務
    // 例如: Sentry.captureException(error, { extra: { context } })
    console.error(`[${context}]`, error)
  } else {
    console.error(`[${context}]`, error)
  }
}