@echo off
echo ========================================
echo GitHub 認證問題修復助手
echo ========================================
echo.

echo ❌ 檢測到 GitHub 認證問題
echo GitHub 已停止支援密碼認證，需要使用 Personal Access Token
echo.

echo 🔐 解決方案：
echo.
echo 1. 創建 Personal Access Token：
echo    - 訪問：https://github.com/settings/tokens
echo    - 點擊 "Generate new token (classic)"
echo    - Note: Bible Reading Quest Deploy
echo    - Expiration: 90 days
echo    - Scopes: 勾選 "repo"
echo    - 點擊 "Generate token"
echo    - 複製生成的 token (ghp_xxxxxxxxxxxxxxxxxxxx)
echo.

echo 2. 使用 Token 推送代碼：
echo.
echo    git remote remove origin
echo    git remote add origin https://YOUR_TOKEN@github.com/appstester0919/bible-reading-quest-2025.git
echo    git push -u origin main
echo.

echo ⚠️  重要提醒：
echo    - Token 只會顯示一次，請立即複製保存
echo    - 將 YOUR_TOKEN 替換為實際的 token
echo    - 不要分享您的 token
echo.

echo 🚀 或者使用更簡單的 GitHub CLI：
echo    1. 下載安裝：https://cli.github.com/
echo    2. 執行：gh auth login
echo    3. 按照提示完成認證
echo    4. 執行：git push -u origin main
echo.

echo ========================================
echo 按任意鍵打開 GitHub Token 設置頁面...
pause >nul
start https://github.com/settings/tokens
echo.
echo Token 創建完成後，請執行：
echo git remote remove origin
echo git remote add origin https://YOUR_TOKEN@github.com/appstester0919/bible-reading-quest-2025.git
echo git push -u origin main
echo.
pause