// Service Worker 更新檢查器
class ServiceWorkerUpdater {
  constructor() {
    this.registration = null;
    this.refreshing = false;
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        
        // 監聽更新
        this.registration.addEventListener('updatefound', () => {
          this.handleUpdate();
        });

        // 監聽控制器變更
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (this.refreshing) return;
          this.refreshing = true;
          window.location.reload();
        });

        console.log('Service Worker 註冊成功');
      } catch (error) {
        console.error('Service Worker 註冊失敗:', error);
      }
    }
  }

  handleUpdate() {
    const newWorker = this.registration.installing;
    
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新版本可用，提示用戶更新
          this.showUpdatePrompt();
        }
      });
    }
  }

  showUpdatePrompt() {
    // 創建更新提示
    const updateBanner = document.createElement('div');
    updateBanner.id = 'sw-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #4F46E5;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
          <span>🔄 網站已更新，點擊重新載入以獲取最新版本</span>
          <button onclick="window.swUpdater.activateUpdate()" style="
            background: white;
            color: #4F46E5;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
          ">重新載入</button>
          <button onclick="window.swUpdater.dismissUpdate()" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
          ">稍後</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(updateBanner);
  }

  activateUpdate() {
    const newWorker = this.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ action: 'skipWaiting' });
    }
  }

  dismissUpdate() {
    const banner = document.getElementById('sw-update-banner');
    if (banner) {
      banner.remove();
    }
  }
}

// 全域實例
window.swUpdater = new ServiceWorkerUpdater();

// 自動初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.swUpdater.init();
  });
} else {
  window.swUpdater.init();
}