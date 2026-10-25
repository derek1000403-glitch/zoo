# 開啟「網站內按讚、訂閱，同步到 YouTube」

照著做大約 20～30 分鐘。全程用**你自己（頻道主）的 Google 帳號**登入操作。
看不懂哪一步，截圖給 Claude 就好。

> 還沒完成之前，網站一樣能用：按讚／訂閱按鈕會開新分頁到 YouTube。

---

## 第 1 步：建立 Google Cloud 專案

1. 打開 <https://console.cloud.google.com/>（第一次用會請你同意條款）
2. 左上角「選取專案」→「新增專案」
3. 專案名稱填：`新時代物理學習平台` → 建立
4. 確認左上角已經切換到這個專案

## 第 2 步：開啟 YouTube Data API

1. 上方搜尋列輸入 **YouTube Data API v3**，點進去
2. 按「**啟用**」

## 第 3 步：設定登入畫面（OAuth 同意畫面）

1. 上方搜尋列輸入 **Google Auth Platform**（或「OAuth 同意畫面」），點進去 →「開始使用」
2. 依序填寫：

| 欄位 | 填這個 |
|---|---|
| 應用程式名稱 | `新時代物理學習平台` |
| 使用者支援電子郵件 | 你的信箱 |
| 目標對象（Audience） | **外部（External）** |
| 開發人員聯絡資訊 | 你的信箱 |

3. 完成後，到左邊選單「**品牌塑造（Branding）**」補上：

| 欄位 | 填這個 |
|---|---|
| 應用程式首頁 | `https://derek1000403-glitch.github.io/zoo/` |
| 隱私權政策連結 | `https://derek1000403-glitch.github.io/zoo/privacy.html` |
| 已授權網域 | `derek1000403-glitch.github.io` |

   > 先**不要上傳 Logo**，上傳 Logo 會多一道審核。

4. 左邊選單「**資料存取（Data Access）**」→「新增或移除範圍」→ 搜尋 `youtube.force-ssl`，
   勾選 **`.../auth/youtube.force-ssl`**（說明是「查看、編輯及永久刪除您的 YouTube 影片、評分、留言和字幕」）→ 更新 → 儲存

   > 這個權限名稱看起來很嚇人，但網站**只用來按讚和訂閱**，隱私權政策裡有寫清楚。這是 Google 規定按讚訂閱必須用的權限。

## 第 4 步：建立「用戶端 ID」

1. 左邊選單「**用戶端（Clients）**」→「建立用戶端」
2. 應用程式類型：**網頁應用程式**
3. 名稱：`網站`
4. 「已授權的 JavaScript 來源」→ 新增 URI：`https://derek1000403-glitch.github.io`
   （注意：**最後面不要加 /zoo，也不要加斜線**）
5. 建立 → 會跳出一串很長的「**用戶端 ID**」，長得像 `123456789-xxxxxxxx.apps.googleusercontent.com`
6. 複製它，然後：
   - 在 GitHub 打開 `videos.js` → ✏️ 編輯 → 貼到最下面 `googleClientId: ""` 的引號裡 → Commit changes
   - 或直接貼給 Claude，我幫你放進去

   > 用戶端 ID 本來就是公開的（每個用 Google 登入的網站都看得到），放在網站上沒有安全問題。
   > 但**「用戶端密鑰」（Client secret）不要給任何人，也不需要**。

## 第 5 步：先自己測試

1. 左邊選單「**目標對象（Audience）**」→「測試使用者」→ 新增你自己的 Gmail（最多可以加 100 個，可以加幾個學生一起測）
2. 打開網站，點一部影片，按「按讚」→ 跳出 Google 登入 → 會看到「Google 尚未驗證這個應用程式」→ 按「繼續」
3. 回到 YouTube 確認那部影片真的被按讚了 🎉

> 這個階段**只有測試使用者能登入**，其他觀眾按了會被 Google 擋下。

## 第 6 步：送 Google 審核（讓所有觀眾都能用）

1. 「目標對象」→ 發布狀態按「**發布應用程式**」
2. 左邊選單「**驗證中心（Verification Center）**」→ 依照指示送出審核
3. Google 通常會要求：
   - **證明網站是你的**（Google Search Console 網域驗證）→ 這一步需要在 GitHub 多建一個儲存庫，**到時候跟 Claude 說，我幫你弄好**
   - **一段示範影片**：錄螢幕，示範「登入 → 按讚 → 到 YouTube 看到讚」，上傳到 YouTube（設不公開）貼連結
   - 說明為什麼需要這個權限：可以直接用下面這段 ↓

> 本網站是物理教學影片平台，觀眾在網站內觀看本頻道的教學影片。我們使用 youtube.force-ssl 權限，僅用於讓觀眾在網站內對正在觀看的影片按讚（videos.rate）、訂閱本頻道（subscriptions.insert / delete），以及查詢目前的按讚與訂閱狀態以顯示按鈕（videos.getRating、subscriptions.list）。存取權杖只保存在使用者瀏覽器中，網站沒有伺服器，不會儲存或分享任何使用者資料。

4. 等待 Google 回信（通常幾天到幾週，可能會來回補資料）

---

## 常見問題

**Q：每天可以按讚訂閱幾次？**
免費額度每天 10,000 點，按讚或訂閱一次 50 點，大約全站每天 200 次。不夠的話可以在 Google Cloud 申請提高。

**Q：會收錢嗎？**
YouTube Data API 本身免費，不需要綁信用卡。

**Q：觀眾的帳號安全嗎？**
網站拿不到觀眾的密碼，登入是 Google 自己的視窗。權限一小時後就失效，觀眾也可以隨時到 Google 帳戶移除。
