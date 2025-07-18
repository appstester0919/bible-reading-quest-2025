// Service Worker for Bible Reading Quest - Fixed redirect issue
const CACHE_NAME = 'bible-reading-quest-v' + Date.now();
const OFFLINE_URL = '/offline';

// 需要快取的核心檔案（移除需要認證的頁面）
const CORE_CACHE_FILES = [
  '/login',
  '/signup',
  '/offline',
  '/manifest.json'
];

// 需要快取的靜態資源
const STATIC_CACHE_FILES = [
  '/_next/static/css/app/layout.css',
  // 動態添加其他靜態資源
];

// 開發環境日誌函數
const isDev = false; // 在生產環境中設為 false
const devLog = (...args) => {
  if (isDev) console.log(...args);
};

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  devLog('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        devLog('Service Worker: Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        devLog('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// 啟動 Service Worker
self.addEventListener('activate', (event) => {
  devLog('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              devLog('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        devLog('Service Worker: Activated successfully');
        // 立即控制所有客戶端，強制更新
        return self.clients.claim();
      })
  );
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  // 跳過非 GET 請求
  if (event.request.method !== 'GET') return;
  
  // 跳過 Chrome 擴展請求
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // 跳過 Supabase 請求（總是從網路獲取最新資料）
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // 如果網路失敗，返回離線頁面
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 跳過需要認證檢查的頁面，讓 middleware 處理重定向
  const url = new URL(event.request.url);
  const protectedPaths = ['/dashboard', '/map', '/leaderboard', '/plan', '/profile'];
  const isProtectedPath = protectedPaths.some(path => url.pathname.startsWith(path));
  
  if (isProtectedPath) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 只快取成功的響應（非重定向）
          if (response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // 網路失敗時，嘗試從快取獲取
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 如果沒有快取，返回離線頁面
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // 處理其他請求（靜態資源等）
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          devLog('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // 檢查是否為有效響應
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 複製響應
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 網路失敗時返回離線頁面
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// 監聽來自客戶端的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 背景同步
self.addEventListener('sync', (event) => {
  devLog('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // 獲取離線儲存的資料
    const pendingData = await getOfflineData();
    
    if (pendingData.length > 0) {
      devLog('Service Worker: Syncing reading progress', pendingData);
      
      // 同步資料到伺服器
      for (const data of pendingData) {
        await syncToServer(data);
      }
      
      // 清除已同步的資料
      await clearSyncedData();
    }
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  devLog('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : '您今天還沒有完成讀經計劃哦！',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '開始讀經',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: '稍後提醒',
        icon: '/icons/icon-192x192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('聖經讀經之旅', options)
  );
});

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  devLog('Service Worker: Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // 不做任何事，只是關閉通知
  } else {
    // 默認行為：打開應用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 輔助函數
async function getOfflineData() {
  // 實現獲取離線資料的邏輯
  return [];
}

async function syncToServer(data) {
  // 實現同步到伺服器的邏輯
}

async function clearSyncedData() {
  // 實現清除已同步資料的邏輯
}