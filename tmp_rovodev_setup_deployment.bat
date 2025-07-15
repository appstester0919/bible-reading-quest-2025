@echo off
echo ========================================
echo 🚀 聖經讀經之旅 - 部署環境檢查與設置
echo ========================================
echo.

echo 📋 檢查當前環境...
echo.

REM 檢查 Node.js
echo 1. 檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝
    echo 📥 請先安裝 Node.js: https://nodejs.org/
    echo    建議下載 LTS 版本
    echo.
    set NEED_NODEJS=1
) else (
    echo ✅ Node.js 已安裝
    node --version
)

echo.

REM 檢查 Git
echo 2. 檢查 Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝
    echo 📥 請先安裝 Git: https://git-scm.com/download/win
    echo.
    set NEED_GIT=1
) else (
    echo ✅ Git 已安裝
    git --version
)

echo.

REM 檢查項目依賴
echo 3. 檢查項目依賴...
if exist "node_modules" (
    echo ✅ 依賴已安裝
) else (
    echo ❌ 需要安裝依賴
    set NEED_INSTALL=1
)

echo.

REM 檢查環境變數
echo 4. 檢查環境配置...
if exist ".env.local" (
    echo ✅ 本地環境配置存在
) else (
    echo ⚠️  需要設置環境變數
    echo    請複製 .env.local.example 為 .env.local 並填入您的 Supabase 配置
    set NEED_ENV=1
)

echo.
echo ========================================
echo 📝 下一步操作建議:
echo ========================================

if defined NEED_NODEJS (
    echo 1. 安裝 Node.js: https://nodejs.org/
)

if defined NEED_GIT (
    echo 2. 安裝 Git: https://git-scm.com/download/win
)

if defined NEED_ENV (
    echo 3. 設置環境變數:
    echo    - 複製 .env.local.example 為 .env.local
    echo    - 填入您的 Supabase URL 和 Key
)

echo.
echo 🌐 部署選項:
echo ========================================
echo.
echo 選項 A: 使用 Vercel 網頁界面 (推薦)
echo   1. 訪問 https://vercel.com
echo   2. 用 GitHub 登入
echo   3. 點擊 "New Project"
echo   4. 上傳項目文件夾或連接 GitHub 倉庫
echo   5. 設置環境變數
echo   6. 部署
echo.
echo 選項 B: 使用 Vercel CLI
echo   1. 確保 Node.js 和 Git 已安裝
echo   2. 運行: npm install -g vercel
echo   3. 運行: vercel
echo   4. 按照提示操作
echo.
echo 選項 C: 使用 GitHub + Vercel 自動部署
echo   1. 創建 GitHub 倉庫
echo   2. 上傳代碼到 GitHub
echo   3. 在 Vercel 中連接 GitHub 倉庫
echo   4. 自動部署
echo.

echo ========================================
echo 💡 需要幫助?
echo ========================================
echo 查看詳細文檔:
echo - QUICK-DEPLOY.md (快速部署)
echo - DEPLOYMENT-STEPS.md (詳細步驟)
echo - DEPLOYMENT-GUIDE.md (完整指南)
echo.

pause