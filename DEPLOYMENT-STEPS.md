# 🚀 部署步驟指南

## 📋 **完整部署清單**

### ✅ **已完成的準備工作**
- [x] 項目代碼完成
- [x] PWA 功能實現
- [x] 安全性優化
- [x] 效能優化
- [x] 部署配置檔案創建

### 🔧 **需要完成的步驟**

#### **1. 安裝 Git (如果還沒有)**
```bash
# 下載並安裝 Git
# https://git-scm.com/download/win

# 驗證安裝
git --version
```

#### **2. 初始化 Git 倉庫**
```bash
# 在項目目錄中執行
git init
git add .
git commit -m "Initial commit: 2025 學青特會讀經應用"
```

#### **3. 創建 GitHub 倉庫**
1. 訪問 [github.com](https://github.com)
2. 點擊 "New repository"
3. 倉庫名稱: `bible-reading-quest-2025`
4. 設為 Public (免費部署需要)
5. 不要初始化 README (我們已經有了)

#### **4. 連接到 GitHub**
```bash
# 替換為您的 GitHub 用戶名
git remote add origin https://github.com/YOUR_USERNAME/bible-reading-quest-2025.git
git branch -M main
git push -u origin main
```

#### **5. 部署到 Vercel**
1. 訪問 [vercel.com](https://vercel.com)
2. 用 GitHub 帳號登入
3. 點擊 "New Project"
4. 選擇 `bible-reading-quest-2025` 倉庫
5. 設置環境變數：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
6. 點擊 "Deploy"

### 🌐 **部署後測試**

#### **桌面測試**
- [ ] Windows Chrome - PWA 安裝
- [ ] Windows Edge - 離線功能
- [ ] 響應式設計檢查

#### **移動端測試**
- [ ] iOS Safari - 添加到主屏幕
- [ ] Android Chrome - PWA 安裝
- [ ] 觸控操作測試

#### **功能測試**
- [ ] 用戶註冊/登入
- [ ] 讀經計劃生成
- [ ] 日曆進度追蹤
- [ ] 地圖拼圖功能
- [ ] 同行榜顯示
- [ ] 離線同步

### 📱 **獲得應用連結**
部署成功後，您會獲得：
- **主要網址**: `https://your-app.vercel.app`
- **自定義域名**: 可在 Vercel 設置中配置

### 🔄 **自動更新設置**
- ✅ 每次推送到 `main` 分支自動部署
- ✅ 預覽部署 (其他分支)
- ✅ 回滾功能

## 🆘 **需要幫助？**

如果在任何步驟遇到問題：
1. 檢查 Vercel 部署日誌
2. 確認環境變數設置正確
3. 驗證 Supabase 配置
4. 檢查 GitHub 倉庫權限

---

**準備好開始了嗎？讓我們一步步完成部署！** 🚀