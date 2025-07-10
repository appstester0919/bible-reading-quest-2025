@echo off
echo ========================================
echo 2025 學青特會 - 讀經應用部署助手
echo ========================================
echo.

echo 檢查 Git 是否已安裝...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝！
    echo 請先安裝 Git: https://git-scm.com/download/win
    echo 安裝完成後重新運行此腳本
    pause
    exit /b 1
)

echo ✅ Git 已安裝

echo.
echo 初始化 Git 倉庫...
git init
git add .
git commit -m "Initial commit: 2025 學青特會讀經應用"

echo.
echo ========================================
echo 🎯 下一步操作指南
echo ========================================
echo.
echo 1. 創建 GitHub 倉庫:
echo    - 訪問 https://github.com/new
echo    - 倉庫名稱: bible-reading-quest-2025
echo    - 設為 Public
echo    - 不要初始化 README
echo.
echo 2. 連接到 GitHub (替換 YOUR_USERNAME):
echo    git remote add origin https://github.com/YOUR_USERNAME/bible-reading-quest-2025.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. 部署到 Vercel:
echo    - 訪問 https://vercel.com
echo    - 用 GitHub 登入
echo    - 選擇您的倉庫
echo    - 設置環境變數
echo    - 點擊 Deploy
echo.
echo ========================================
pause