# 🔐 GitHub 認證問題解決方案

## ❌ **問題說明**
GitHub 已停止支援密碼認證，需要使用 Personal Access Token (PAT)。

## ✅ **解決方案 (推薦方法)**

### **方法 1: 使用 Personal Access Token**

#### **步驟 1: 創建 Personal Access Token**
1. 訪問 [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. 點擊 "Generate new token" > "Generate new token (classic)"
3. 設置：
   - **Note**: `Bible Reading Quest Deploy`
   - **Expiration**: `90 days` (或選擇更長時間)
   - **Scopes**: 勾選 `repo` (完整倉庫訪問權限)
4. 點擊 "Generate token"
5. **重要**: 複製並保存這個 token (只會顯示一次)

#### **步驟 2: 使用 Token 推送代碼**
```bash
# 移除舊的 remote
git remote remove origin

# 使用 token 添加新的 remote (替換 YOUR_TOKEN)
git remote add origin https://YOUR_TOKEN@github.com/appstester0919/bible-reading-quest-2025.git

# 推送代碼
git push -u origin main
```

### **方法 2: 使用 GitHub CLI (更簡單)**

#### **安裝 GitHub CLI**
1. 訪問 [cli.github.com](https://cli.github.com/)
2. 下載並安裝 GitHub CLI

#### **使用 GitHub CLI 認證**
```bash
# 登入 GitHub
gh auth login

# 選擇 GitHub.com
# 選擇 HTTPS
# 選擇 Login with a web browser
# 按照提示完成認證

# 推送代碼
git push -u origin main
```

### **方法 3: 使用 SSH (最安全)**

#### **生成 SSH 密鑰**
```bash
# 生成新的 SSH 密鑰
ssh-keygen -t ed25519 -C "your-email@example.com"

# 啟動 SSH agent
eval "$(ssh-agent -s)"

# 添加 SSH 密鑰
ssh-add ~/.ssh/id_ed25519
```

#### **添加 SSH 密鑰到 GitHub**
1. 複製公鑰內容：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. 訪問 [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
3. 點擊 "New SSH key"
4. 貼上公鑰內容
5. 點擊 "Add SSH key"

#### **使用 SSH URL**
```bash
# 移除 HTTPS remote
git remote remove origin

# 添加 SSH remote
git remote add origin git@github.com:appstester0919/bible-reading-quest-2025.git

# 推送代碼
git push -u origin main
```

## 🚀 **快速解決 (推薦)**

**最簡單的方法是使用 Personal Access Token：**

1. **創建 Token**: [github.com/settings/tokens](https://github.com/settings/tokens)
2. **複製 Token**: 例如 `ghp_xxxxxxxxxxxxxxxxxxxx`
3. **執行命令**:
   ```bash
   git remote remove origin
   git remote add origin https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/appstester0919/bible-reading-quest-2025.git
   git push -u origin main
   ```

## ⚠️ **安全提醒**

- **不要分享** Personal Access Token
- **定期更新** Token
- **使用最小權限** (只勾選需要的 scopes)
- **考慮使用 SSH** 獲得更好的安全性

## 🆘 **如果還有問題**

1. 確認倉庫名稱正確
2. 確認 Token 權限包含 `repo`
3. 檢查網路連接
4. 嘗試重新生成 Token

---

**選擇最適合您的方法，完成認證後就能成功推送代碼了！** 🎯