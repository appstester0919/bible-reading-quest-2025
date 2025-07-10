# 2025 學青特會 - 盡

一個幫助年輕基督徒制定和跟蹤聖經閱讀計劃的 PWA 應用程序。

## ✨ 功能特色

### 📖 智能讀經計劃
- 自定義每日章數
- 新舊約同時進行模式
- 智能進度平衡算法

### 🗺️ 應許之地拼圖
- 真實以色列地圖背景
- 完成書卷解鎖地圖區域
- "得地為業"的視覺體驗

### 📅 讀經日曆
- 直觀的進度追蹤
- 完成狀態清晰標示
- 點擊查看每日計劃

### 🏆 同行榜
- 跑道風格排行榜
- 里程碑進度顯示
- 激勵競爭機制

### 📱 PWA 功能
- 跨平台離線使用
- 可安裝為原生應用
- 自動背景同步

## 🚀 技術架構

- **前端**: Next.js 15 + React 19 + TypeScript
- **後端**: Supabase (PostgreSQL + Auth)
- **樣式**: Tailwind CSS
- **PWA**: Service Worker + IndexedDB
- **部署**: Vercel

## 📱 支援平台

- ✅ Windows (Chrome, Edge, Firefox)
- ✅ macOS (Safari, Chrome, Firefox)
- ✅ iOS (Safari - 可添加到主屏幕)
- ✅ Android (Chrome - 可安裝為應用)

## 🛠️ 本地開發

```bash
# 安裝依賴
npm install

# 設置環境變數
cp .env.local.example .env.local
# 編輯 .env.local 填入 Supabase 配置

# 啟動開發服務器
npm run dev
```

## 📊 資料庫設置

在 Supabase 中執行以下 SQL：

```sql
-- 創建用戶資料表
-- 見 create_profiles_table.sql

-- 創建進度表
-- 見 create_progress_table.sql

-- 設置存儲政策
-- 見 storage_policy.sql
```

## 🌐 部署

本項目已配置為在 Vercel 上一鍵部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bible-reading-quest)

### 環境變數設置

在 Vercel 中設置以下環境變數：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📄 授權

本項目僅供教會內非牟利使用。

地圖來源：[聖光聖經地理資訊網](https://biblegeography.holylight.org.tw/index/condensedbible_map_detail?m_id=106)

---

**2025 學青特會 - 盡** | 完成66卷聖經，跑完讀經循環賽一次 🏃‍♂️📚