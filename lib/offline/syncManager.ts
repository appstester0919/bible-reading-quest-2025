'use client'

import { createClient } from '@/lib/supabase/client'
import { indexedDBManager, type OfflineProgress } from './indexedDB'

class SyncManager {
  private supabase = createClient()
  private isOnline = true
  private syncInProgress = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeNetworkListeners()
      this.initializeServiceWorkerListener()
    }
  }

  private initializeNetworkListeners() {
    // 監聽網路狀態變化
    window.addEventListener('online', () => {
      console.log('網路已連接，開始同步資料')
      this.isOnline = true
      this.syncAllData()
    })

    window.addEventListener('offline', () => {
      console.log('網路已斷開，切換到離線模式')
      this.isOnline = false
    })

    // 初始化網路狀態
    this.isOnline = navigator.onLine
  }

  private initializeServiceWorkerListener() {
    // 監聽來自 Service Worker 的消息
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_READING_PROGRESS') {
        this.syncReadingProgress()
      }
    })
  }

  // 記錄讀經進度（離線優先）
  async recordReadingProgress(userId: string, readDate: string): Promise<boolean> {
    const progressData: OfflineProgress = {
      user_id: userId,
      read_date: readDate,
      completed_at: new Date().toISOString(),
      synced: false
    }

    try {
      // 先嘗試線上同步
      if (this.isOnline) {
        const { error } = await this.supabase
          .from('progress')
          .insert({
            user_id: userId,
            read_date: readDate,
            completed_at: progressData.completed_at
          })

        if (!error) {
          console.log('讀經進度已成功同步到雲端')
          return true
        } else {
          console.warn('線上同步失敗，儲存到離線快取:', error)
        }
      }

      // 如果線上同步失敗或離線，儲存到本地
      await indexedDBManager.saveOfflineProgress(progressData)
      console.log('讀經進度已儲存到離線快取')

      // 註冊背景同步（如果支援）
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('background-sync-reading-progress')
      }

      return true
    } catch (error) {
      console.error('記錄讀經進度失敗:', error)
      return false
    }
  }

  // 刪除讀經進度（離線優先）
  async removeReadingProgress(userId: string, readDate: string): Promise<boolean> {
    try {
      // 先嘗試線上同步
      if (this.isOnline) {
        const { error } = await this.supabase
          .from('progress')
          .delete()
          .match({ user_id: userId, read_date: readDate })

        if (!error) {
          console.log('讀經進度已從雲端刪除')
          return true
        } else {
          console.warn('線上刪除失敗:', error)
        }
      }

      // 記錄刪除操作到離線快取
      const deleteOperation: OfflineProgress = {
        user_id: userId,
        read_date: readDate,
        completed_at: new Date().toISOString(),
        synced: false
      }

      await indexedDBManager.saveOfflineProgress({
        ...deleteOperation,
        // 使用特殊標記表示這是刪除操作
        completed_at: 'DELETE_OPERATION'
      })

      return true
    } catch (error) {
      console.error('刪除讀經進度失敗:', error)
      return false
    }
  }

  // 同步所有離線資料
  async syncAllData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return
    }

    this.syncInProgress = true

    try {
      await this.syncReadingProgress()
      console.log('所有離線資料同步完成')
    } catch (error) {
      console.error('資料同步失敗:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // 同步讀經進度
  private async syncReadingProgress(): Promise<void> {
    try {
      const unsyncedProgress = await indexedDBManager.getUnsyncedProgress()
      
      if (unsyncedProgress.length === 0) {
        console.log('沒有需要同步的讀經進度')
        return
      }

      console.log(`開始同步 ${unsyncedProgress.length} 條讀經進度`)

      for (const progress of unsyncedProgress) {
        try {
          if (progress.completed_at === 'DELETE_OPERATION') {
            // 處理刪除操作
            await this.supabase
              .from('progress')
              .delete()
              .match({ user_id: progress.user_id, read_date: progress.read_date })
          } else {
            // 處理新增操作
            await this.supabase
              .from('progress')
              .upsert({
                user_id: progress.user_id,
                read_date: progress.read_date,
                completed_at: progress.completed_at
              })
          }

          // 標記為已同步
          if (progress.id) {
            await indexedDBManager.markProgressAsSynced(progress.id)
          }

          console.log(`同步完成: ${progress.read_date}`)
        } catch (error) {
          console.error(`同步失敗 ${progress.read_date}:`, error)
        }
      }
    } catch (error) {
      console.error('同步讀經進度時出現錯誤:', error)
    }
  }

  // 獲取網路狀態
  getNetworkStatus(): boolean {
    return this.isOnline
  }

  // 手動觸發同步
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('目前處於離線狀態，無法同步')
    }

    await this.syncAllData()
  }

  // 獲取待同步項目數量
  async getPendingSyncCount(): Promise<number> {
    try {
      const unsyncedProgress = await indexedDBManager.getUnsyncedProgress()
      return unsyncedProgress.length
    } catch (error) {
      console.error('獲取待同步項目數量失敗:', error)
      return 0
    }
  }
}

// 創建單例實例
export const syncManager = new SyncManager()