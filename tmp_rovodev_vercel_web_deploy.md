# 🚀 最簡單的 Vercel 部署方法 (無需安裝任何軟件)

## 📱 方法一: 直接上傳文件夾到 Vercel

### 步驟 1: 準備項目文件
1. 確保您的項目文件夾包含所有必要文件
2. 檢查 `package.json` 存在
3. 檢查 `vercel.json` 存在

### 步驟 2: 訪問 Vercel
1. 打開瀏覽器，訪問 https://vercel.com
2. 點擊 "Sign Up" 或 "Log In"
3. 選擇 "Continue with GitHub" (推薦) 或其他登入方式

### 步驟 3: 創建新項目
1. 登入後，點擊 "New Project"
2. 選擇 "Browse" 或拖拽您的項目文件夾
3. 上傳整個 `bible-reading-quest` 文件夾

### 步驟 4: 配置項目
1. **Project Name**: `bible-reading-quest-2025` (或您喜歡的名稱)
2. **Framework**: 自動檢測為 "Next.js"
3. **Root Directory**: 保持默認 "./"
4. **Build Command**: 保持默認 "npm run build"
5. **Output Directory**: 保持默認 ".next"

### 步驟 5: 設置環境變數 (重要!)
在 "Environment Variables" 部分添加:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [您的 Supabase 項目 URL]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: [您的 Supabase 匿名密鑰]
```

**如何獲取 Supabase 配置:**
1. 訪問 https://supabase.com
2. 登入您的帳號
3. 選擇您的項目
4. 進入 Settings > API
5. 複製 "Project URL" 和 "anon public" key

### 步驟 6: 部署
1. 點擊 "Deploy"
2. 等待 2-3 分鐘完成構建
3. 獲得您的應用網址: `https://your-project-name.vercel.app`

## 🎯 部署後測試

### 基本功能測試
- [ ] 網站能正常打開
- [ ] 頁面顯示正確
- [ ] 沒有明顯錯誤

### 如果遇到問題
1. 檢查 Vercel 部署日誌中的錯誤信息
2. 確認環境變數設置正確
3. 檢查 Supabase 配置是否有效

## 📱 方法二: 使用 GitHub (推薦長期使用)

如果您想要自動部署和版本控制:

### 步驟 1: 創建 GitHub 倉庫
1. 訪問 https://github.com/new
2. 倉庫名稱: `bible-reading-quest-2025`
3. 設為 Public (免費部署需要)
4. 不要勾選 "Add a README file"

### 步驟 2: 上傳代碼
如果您有 Git:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bible-reading-quest-2025.git
git push -u origin main
```

如果沒有 Git，可以:
1. 下載 GitHub Desktop: https://desktop.github.com/
2. 或直接在 GitHub 網頁上傳文件

### 步驟 3: 連接 Vercel
1. 在 Vercel 中點擊 "New Project"
2. 選擇 "Import Git Repository"
3. 選擇您的 GitHub 倉庫
4. 設置環境變數 (同上)
5. 部署

## 🆘 常見問題解決

### Q: 部署失敗，顯示構建錯誤
A: 檢查 Vercel 部署日誌，通常是:
- 環境變數未設置
- 依賴安裝失敗
- 代碼語法錯誤

### Q: 網站打開但功能不正常
A: 檢查:
- Supabase 配置是否正確
- 環境變數是否設置
- 瀏覽器控制台是否有錯誤

### Q: 無法登入或註冊
A: 確認:
- SUPABASE_URL 格式正確 (https://xxx.supabase.co)
- SUPABASE_ANON_KEY 是 "anon public" 密鑰
- Supabase 項目狀態正常

## 🎉 部署成功!

部署成功後，您將獲得:
- 🌐 公開網址: `https://your-project.vercel.app`
- 📱 PWA 功能: 用戶可以安裝到手機
- 🔄 自動更新: 每次代碼更改自動重新部署 (如果使用 GitHub)
- 📊 分析數據: Vercel 提供訪問統計

享受您的聖經讀經應用! 🙏