'use client'

import { useEffect, useState } from 'react'
import { indexedDBManager } from '@/lib/offline/indexedDB'
import { syncManager } from '@/lib/offline/syncManager'

interface PWAProviderProps {
  children: React.ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)

  useEffect(() => {
    const initializePWA = async () => {
      try {
        // 初始化 IndexedDB
        await indexedDBManager.init()
        if (process.env.NODE_ENV === 'development') {
          console.log('IndexedDB 初始化成功')
        }

        // 註冊 Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker 註冊成功:', registration.scope)
          }

          // 監聽 Service Worker 更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('新的 Service Worker 已安裝，準備更新')
                  }
                  // 可以在這裡顯示更新提示
                }
              })
            }
          })
        }

        // 初始化網路狀態監聽
        const updateOnlineStatus = () => {
          setIsOnline(navigator.onLine)
        }

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        updateOnlineStatus()

        // 定期更新待同步項目數量
        const updatePendingCount = async () => {
          const count = await syncManager.getPendingSyncCount()
          setPendingSyncCount(count)
        }

        updatePendingCount()
        const interval = setInterval(updatePendingCount, 30000) // 每30秒檢查一次

        setIsInitialized(true)

        return () => {
          window.removeEventListener('online', updateOnlineStatus)
          window.removeEventListener('offline', updateOnlineStatus)
          clearInterval(interval)
        }
      } catch (error) {
        console.error('PWA 初始化失敗:', error) // 錯誤日誌保留
        setIsInitialized(true) // 即使失敗也要繼續載入應用
      }
    }

    initializePWA()
  }, [])

  // 如果還在初始化，顯示載入畫面
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">📖</span>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">聖經讀經之旅</h2>
          <p className="text-white/80 text-sm">正在初始化離線功能...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      
      {/* 網路狀態指示器 */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-medium z-50">
          <div className="flex items-center justify-center space-x-2">
            <span>📱</span>
            <span>離線模式</span>
            {pendingSyncCount > 0 && (
              <span className="bg-orange-600 px-2 py-1 rounded-full text-xs">
                {pendingSyncCount} 項待同步
              </span>
            )}
          </div>
        </div>
      )}

      {/* 同步狀態指示器 */}
      {isOnline && pendingSyncCount > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium z-50">
          <div className="flex items-center justify-center space-x-2">
            <span className="animate-spin">⚡</span>
            <span>正在同步資料...</span>
            <span className="bg-blue-600 px-2 py-1 rounded-full text-xs">
              {pendingSyncCount} 項
            </span>
          </div>
        </div>
      )}
    </>
  )
}