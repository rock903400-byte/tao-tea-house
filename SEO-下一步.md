# 陶茶雅舍 SEO 下一步操作指南

> 以下是你需要「自己到 Google 外部平台操作」的項目，每一個都是免費的，
> 對搜尋排名影響非常大，尤其是**在地搜尋**（別人搜「台南陶藝教室」時你的排名）。

---

## 1. Google 商家檔案（Google Business Profile）⭐ 最重要

**影響力：★★★★★（在地搜尋第一名的影響因素）**

這是在 Google 搜尋和 Google 地圖上顯示你商家資訊的地方。別人搜「台南 陶藝教室」「新營 茶藝」時，有商家檔案的店家會優先出現在地圖上。

### 1-1 先確認有沒有被建立過

1. 開啟 [Google 商家檔案](https://business.google.com/)
2. 用你的 Google 帳號登入
3. 搜尋「陶茶雅舍」或「台南市新營區三民路92-2號」
4. 如果**已經有資料** → 點進去「認領」（Verify）即可
5. 如果**沒有** → 點「沒有？繼續建立商家」

### 1-2 建立/認領流程

1. 商家名稱：`陶茶雅舍`
2. 地址：`台南市新營區三民路92-2號 2樓`
3. 業務類別：`陶藝教室`、`茶藝教室`（可加多個類別）
4. 服務區域：`台南市`
5. 電話：`0919-897-351`
6. 網站：`https://rock903400-byte.github.io/tao-tea-house/`
7. 營業時間：依實際營業時間設定（或標示「預約制」）
8. 照片：上傳 logo、hero、作品、上課照片

### 1-3 驗證（Verify）

Google 會要求驗證商家真實性，通常有以下方式：
- **明信片**（最常見）：Google 寄一張帶驗證碼的明信片到你的地址，約 5-10 天
- **電話驗證**：如果有的話最快
- **電子郵件驗證**：部分商家可選

### 1-4 完成後持續做的事

- 每週上傳 1-2 張新照片（作品、上課實況）
- 回覆所有顧客評論（正面負面都要回）
- 鼓勵來上課的學員在 Google 評論區留言

---

## 2. Google Search Console 手動提交 Sitemap ⭐

**影響力：★★★★☆（加速 Google 收錄你的網站）**

你已經有 `googled9c46a59baa83166.html` 驗證檔，代表你已驗證過 Google Search Console。但你可能還沒**手動提交 sitemap**，這樣 Google 不一定會主動來爬你的網站。

### 操作步驟

1. 開啟 [Google Search Console](https://search.google.com/search-console)
2. 左側選單 → 點「**Sitemaps**」（站點地圖）
3. 在「新增站點地圖」欄位輸入：`sitemap.xml`
4. 點「**提交**」
5. 等 1-3 天，Google 會開始爬你的頁面和圖片

### 建議同步做的事

- 到「**網頁**」頁籤，確認你的兩頁都有被收錄（狀態顯示「已編入索引」）
- 如果某頁沒出現，可以用「網址審查」手動提交該頁

---

## 3. Google Analytics 追蹤（選做但推薦）

**影響力：★★☆☆☆（不直接影響排名，但讓你知道哪些關鍵字帶流量）**

### 安裝方式

1. 開啟 [Google Analytics](https://analytics.google.com/)
2. 用 Google 帳號建立「帳戶」和「資源」
3. 建立「網頁」資料串流，網址填：`https://rock903400-byte.github.io/tao-tea-house/`
4. 取得 **GA4 追蹤 ID**（格式：`G-XXXXXXXXXX`）
5. 把下面這段程式碼貼到 `index.html` 和 `course-tea.html` 的 `</head>` 前面：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

> 把 `G-XXXXXXXXXX` 換成你實際拿到的 ID。

---

## 4. Bing Webmaster Tools（選做）

**影響力：★★☆☆☆（Bing 佔搜尋市場約 10%，免費就做了吧）**

### 操作步驟

1. 開啟 [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. 用 Microsoft 帳號登入
3. 點「**Add a site**」
4. 輸入：`https://rock903400-byte.github.io/tao-tea-house/`
5. 驗證方式：選「**Add a meta tag**」，複製 `<meta>` 標籤貼到 `<head>` 裡
   - 或者選「**HTML file**」下載驗證檔放到 `assets/` 目錄
6. 驗證通過後，提交 sitemap：`https://rock903400-byte.github.io/tao-tea-house/sitemap.xml`

---

## 5. 收集顧客評論（最重要的人工 SEO）

**影響力：★★★★★（評論數和星級直接影響在地搜尋排名和點閱率）**

Google 商家檔案上的評論越多、評分越高，別人在搜尋「台南 陶藝」時就越容易看到你。

### 怎麼做

1. **每堂課結束後**，請學員掃 QR Code 到 Google 評論區留評論
2. **FB 私訊的客戶回饋**，截圖貼到 Google 商家的照片區
3. **建立 QR Code**：在 Google 商家檔案 →「分享你的商家」→ 複製評論連結
4. 評論連結格式：`https://g.page/r/你的商家ID/review`

### 回覆評論範例

正面評論：
> 感謝您的蒞臨！很開心您喜歡這堂課，歡迎再來陶茶雅舍坐坐喝茶～🍵

負面評論：
> 感謝您的回饋，我們非常重視您的意見。會後與老師討論改進，歡迎您再來體驗，讓我們有機會做得更好。

---

## 6. 自訂網域（進階選配）

**影響力：★★★☆☆（專業度加分，長期值得投資）**

目前網址是 `rock903400-byte.github.io/tao-tea-house/`，如果想升級為自訂網域：

1. 買一個網域名稱（推薦 [Namecheap](https://www.namecheap.com/) 或 [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)，一年約 US$10-15）
2. 建議買：`tao-tea-house.com.tw` 或 `taoteahouse.tw`
3. 在 GitHub repo → Settings → Pages → Custom domain 填入你的網域
4. 設定 DNS 指向 GitHub Pages（GitHub 有教學）
5. 勾選「Enforce HTTPS」

---

## 執行優先順序

| 順序 | 項目 | 預計時間 | 影響力 |
|---|---|---|---|
| 1 | Google 商家檔案（建立/認領） | 30 分鐘 | ★★★★★ |
| 2 | Google Search Console 提交 sitemap | 5 分鐘 | ★★★★☆ |
| 3 | 收集顧客評論（開始累積） | 持續性 | ★★★★★ |
| 4 | Google Analytics 安裝 | 20 分鐘 | ★★☆☆☆ |
| 5 | Bing Webmaster Tools | 10 分鐘 | ★★☆☆☆ |
| 6 | 自訂網域（選做） | 1-2 小時 | ★★★☆☆ |

---

## 網站已做的技術優化（程式碼已就緒）

以下項目已在程式碼中完成，推上 GitHub 後自動生效：

- ✅ Schema.org 結構化資料（LocalBusiness + 4 項 Service）
- ✅ Open Graph 社群分享（含圖片尺寸）
- ✅ Twitter Card
- ✅ 在地 SEO geo 標籤（新營區經緯度）
- ✅ Google 圖片搜尋 sitemap（image:image 標記）
- ✅ 圖片 alt 文字強化（含關鍵字）
- ✅ `<title>` 與 `<meta description>` 關鍵字優化
- ✅ `<link rel="me">` 連結 FB 粉專
- ✅ 效能優化（dns-prefetch、theme-color）
- ✅ 移除過時 meta keywords
- ✅ Course schema provider 升級為 LocalBusiness

---

## 關鍵字策略參考

以下是你可以觀察 Google 排名變化的關鍵字：

| 關鍵字 | 預期效果 |
|---|---|
| 台南陶藝教室 | 高——LocalBusiness schema + geo 標籤 |
| 新營茶藝 | 高——在地搜尋 + 商家檔案 |
| 台南手捏壺 | 中——alt 文字 + 圖片搜尋 |
| 茶藝體驗台南 | 中——title + description |
| 台南茶葉推薦 | 低——需累積評論和內容 |
| 陶藝課程台南 | 高——Service schema + 商家類別 |

---

最後更新：2026-07-19
