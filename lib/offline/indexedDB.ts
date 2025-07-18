// IndexedDB 管理器，用於離線資料儲存

export interface OfflineProgress {
  id?: number
  user_id: string
  read_date: string
  completed_at: string
  synced: boolean
}

export interface OfflinePlan {
  id?: number
  user_id: string
  plan_data: any
  last_updated: string
}

export interface CachedBibleContent {
  id?: number
  book_name: string
  chapter: number
  content: string
  cached_at: string
}

class IndexedDBManager {
  private dbName = 'BibleReadingQuestDB'
  private version = 2 // 增加版本號以觸發升級
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('無法打開 IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 創建離線進度表
        if (!db.objectStoreNames.contains('offline_progress')) {
          const progressStore = db.createObjectStore('offline_progress', {
            keyPath: 'id',
            autoIncrement: true
          })
          progressStore.createIndex('user_id', 'user_id', { unique: false })
          progressStore.createIndex('read_date', 'read_date', { unique: false })
          progressStore.createIndex('synced', 'synced', { unique: false })
        }

        // 創建離線計劃表
        if (!db.objectStoreNames.contains('offline_plans')) {
          const planStore = db.createObjectStore('offline_plans', {
            keyPath: 'id',
            autoIncrement: true
          })
          planStore.createIndex('user_id', 'user_id', { unique: true })
        }

        // 創建快取聖經內容表
        if (!db.objectStoreNames.contains('cached_bible_content')) {
          const contentStore = db.createObjectStore('cached_bible_content', {
            keyPath: 'id',
            autoIncrement: true
          })
          contentStore.createIndex('book_chapter', ['book_name', 'chapter'], { unique: true })
        }

        // 創建應用設定表
        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings', { keyPath: 'key' })
        }
      }
    })
  }

  // 離線進度管理
  async saveOfflineProgress(progress: OfflineProgress): Promise<void> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readwrite')
      const store = transaction.objectStore('offline_progress')
      
      const request = store.add(progress)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('儲存離線進度失敗'))
    })
  }

  async getUnsyncedProgress(): Promise<OfflineProgress[]> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readonly')
      const store = transaction.objectStore('offline_progress')
      
      const request = store.getAll()
      
      request.onsuccess = () => {
        const allProgress = request.result as OfflineProgress[]
        const unsyncedProgress = allProgress.filter(progress => !progress.synced)
        resolve(unsyncedProgress)
      }
      request.onerror = () => reject(new Error('獲取未同步進度失敗'))
    })
  }

  async markProgressAsSynced(id: number): Promise<void> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readwrite')
      const store = transaction.objectStore('offline_progress')
      
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const progress = getRequest.result
        if (progress) {
          progress.synced = true
          const updateRequest = store.put(progress)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(new Error('標記同步狀態失敗'))
        } else {
          reject(new Error('找不到指定的進度記錄'))
        }
      }
      
      getRequest.onerror = () => reject(new Error('獲取進度記錄失敗'))
    })
  }

  // 離線計劃管理
  async saveOfflinePlan(plan: OfflinePlan): Promise<void> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_plans'], 'readwrite')
      const store = transaction.objectStore('offline_plans')
      
      const request = store.put(plan)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('儲存離線計劃失敗'))
    })
  }

  async getOfflinePlan(userId: string): Promise<OfflinePlan | null> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_plans'], 'readonly')
      const store = transaction.objectStore('offline_plans')
      const index = store.index('user_id')
      
      const request = index.get(userId)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('獲取離線計劃失敗'))
    })
  }

  // 快取聖經內容管理
  async cacheBibleContent(content: CachedBibleContent): Promise<void> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_bible_content'], 'readwrite')
      const store = transaction.objectStore('cached_bible_content')
      
      const request = store.put(content)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('快取聖經內容失敗'))
    })
  }

  async getCachedBibleContent(bookName: string, chapter: number): Promise<CachedBibleContent | null> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_bible_content'], 'readonly')
      const store = transaction.objectStore('cached_bible_content')
      const index = store.index('book_chapter')
      
      const request = index.get([bookName, chapter])
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('獲取快取聖經內容失敗'))
    })
  }

  // 應用設定管理
  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['app_settings'], 'readwrite')
      const store = transaction.objectStore('app_settings')
      
      const request = store.put({ key, value })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('儲存設定失敗'))
    })
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('資料庫未初始化')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['app_settings'], 'readonly')
      const store = transaction.objectStore('app_settings')
      
      const request = store.get(key)
      
      request.onsuccess = () => resolve(request.result?.value || null)
      request.onerror = () => reject(new Error('獲取設定失敗'))
    })
  }

  // 清理舊資料
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    if (!this.db) throw new Error('資料庫未初始化')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    // 清理舊的快取內容
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_bible_content'], 'readwrite')
      const store = transaction.objectStore('cached_bible_content')
      
      const request = store.openCursor()
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const content = cursor.value as CachedBibleContent
          const cachedDate = new Date(content.cached_at)
          
          if (cachedDate < cutoffDate) {
            cursor.delete()
          }
          
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => reject(new Error('清理舊資料失敗'))
    })
  }
}

// 創建單例實例
export const indexedDBManager = new IndexedDBManager()