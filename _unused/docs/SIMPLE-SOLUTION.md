# ⚡ 最簡單的解決方案

## 🎯 **3 步驟解決 GitHub 認證問題**

### **步驟 1: 創建 Personal Access Token**
1. 點擊這個連結：[創建 Token](https://github.com/settings/tokens/new)
2. 填寫設置：
   - **Note**: `Bible Reading Quest`
   - **Expiration**: `90 days`
   - **Select scopes**: 勾選 `repo` ✅
3. 點擊 **"Generate token"**
4. **立即複製** token (類似：`ghp_1234567890abcdef...`)

### **步驟 2: 更新 Git Remote**
打開命令提示符，執行以下命令（替換 `YOUR_TOKEN`）：

```bash
git remote remove origin
git remote add origin https://YOUR_TOKEN@github.com/appstester0919/bible-reading-quest-2025.git
```

### **步驟 3: 推送代碼**
```bash
git push -u origin main
```

## 📝 **完整命令示例**

假設您的 token 是 `ghp_abc123def456`，完整命令如下：

```bash
git remote remove origin
git remote add origin https://ghp_abc123def456@github.com/appstester0919/bible-reading-quest-2025.git
git push -u origin main
```

## ✅ **成功標誌**

如果看到類似以下輸出，表示成功：
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Writing objects: 100% (45/45), 1.2 MiB | 2.1 MiB/s, done.
Total 45 (delta 0), reused 0 (delta 0)
To https://github.com/appstester0919/bible-reading-quest-2025.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## 🚀 **下一步：部署到 Vercel**

代碼推送成功後：
1. 訪問 [vercel.com](https://vercel.com)
2. 用 GitHub 登入
3. 選擇 `bible-reading-quest-2025` 倉庫
4. 設置環境變數
5. 點擊 Deploy

---

**遇到問題？** 運行 `fix-github-auth.bat` 獲得詳細幫助！