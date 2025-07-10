# ⚡ 快速部署指南

## 🚀 **一鍵開始**

雙擊運行 `deploy-setup.bat` 腳本，它會自動：
- ✅ 檢查 Git 安裝
- ✅ 初始化 Git 倉庫
- ✅ 提交所有檔案
- ✅ 顯示後續步驟

## 📱 **手動步驟 (如果腳本無法運行)**

### **1. 創建 GitHub 倉庫**
1. 訪問 [github.com/new](https://github.com/new)
2. 倉庫名稱: `bible-reading-quest-2025`
3. 設為 **Public** (免費部署需要)
4. **不要**勾選 "Add a README file"
5. 點擊 "Create repository"

### **2. 上傳代碼到 GitHub**
```bash
# 在項目目錄中打開命令提示符，執行：
git init
git add .
git commit -m "Initial commit: 2025 學青特會讀經應用"

# 替換 YOUR_USERNAME 為您的 GitHub 用戶名
git remote add origin https://github.com/YOUR_USERNAME/bible-reading-quest-2025.git
git branch -M main
git push -u origin main
```

### **3. 部署到 Vercel**
1. 訪問 [vercel.com](https://vercel.com)
2. 點擊 "Continue with GitHub"
3. 授權 Vercel 訪問您的 GitHub
4. 點擊 "New Project"
5. 找到 `bible-reading-quest-2025` 倉庫
6. 點擊 "Import"

### **4. 設置環境變數**
在 Vercel 部署頁面中添加：
```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
```

### **5. 完成部署**
- 點擊 "Deploy"
- 等待 2-3 分鐘
- 獲得您的應用網址: `https://your-app.vercel.app`

## 🎯 **部署後測試清單**

### **基本功能測試**
- [ ] 網站能正常打開
- [ ] 用戶註冊/登入功能
- [ ] 讀經計劃生成
- [ ] 日曆顯示正確

### **PWA 功能測試**
- [ ] 瀏覽器顯示安裝提示
- [ ] 離線功能正常
- [ ] 添加到主屏幕

### **跨設備測試**
- [ ] 手機瀏覽器測試
- [ ] 平板電腦測試
- [ ] 不同瀏覽器測試

## 🆘 **常見問題**

### **Q: Git 命令無法執行？**
A: 請先安裝 Git: https://git-scm.com/download/win

### **Q: GitHub 推送失敗？**
A: 檢查倉庫名稱和用戶名是否正確

### **Q: Vercel 部署失敗？**
A: 檢查環境變數是否設置正確

### **Q: 應用無法登入？**
A: 確認 Supabase URL 和 Key 是否正確

---

**需要幫助？** 請檢查 `DEPLOYMENT-STEPS.md` 獲得詳細說明！