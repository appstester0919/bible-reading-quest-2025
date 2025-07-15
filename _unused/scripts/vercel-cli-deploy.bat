@echo off
echo ========================================
echo Vercel CLI 部署助手
echo ========================================
echo.

echo 🔍 檢測到 Vercel 網頁部署問題
echo 讓我們嘗試使用 CLI 方式部署...
echo.

echo 📦 安裝 Vercel CLI...
npm install -g vercel

echo.
echo 🚀 開始部署...
echo 請按照提示操作：
echo 1. 選擇 "Link to existing project" 或 "Create new project"
echo 2. 如果是新項目，輸入項目名稱
echo 3. 確認設置
echo.

vercel --prod

echo.
echo ========================================
echo 部署完成！
echo 如果成功，您會看到部署 URL
echo ========================================
pause