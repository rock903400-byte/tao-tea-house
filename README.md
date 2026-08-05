# 陶茶雅舍 Tao · Tea · Art House

> 陶藝 × 品茶｜在泥與火之間，找回生活的溫度台南新營・30 年手捏壺職人

品牌形象網＋識茶學/陶藝課報名系統，部署於 Cloudflare Pages，內容由 Cloudflare Worker API（D1）提供。

---

## 📁 專案結構

```
tao-tea-house/
├── index.html              # 品牌形象首頁
├── course-tea.html         # 識茶學體驗課報名頁
├── course-pottery.html     # 緞泥手捏陶藝課報名頁
├── admin/index.html        # 管理後台（登入後可改課程/報名/聯絡資訊等）
├── css/style.css           # 統一樣式（東方禪風）
├── js/
│   ├── main.js             # 互動功能（漢堡選單、Lightbox、進度條、Timeline 折疊）
│   ├── live.js             # 從 Worker API 載入動態內容（含地圖嵌入）
│   └── signup.js           # 報名表單（modal + API）
├── backend/
│   ├── src/worker.js       # Cloudflare Worker（API + D1 + 登入驗證）
│   └── scripts/seed-api.mjs# 種子資料匯入腳本
├── assets/                 # 圖片（全英文檔名，含 2x 版本）
├── sitemap.xml / robots.txt# SEO
└── README.md
```

---

## 🎨 設計系統

| 項目   | 規格                      |
| ------ | ------------------------- |
| 主色   | `#2C4A3E` 墨綠（茶湯）    |
| 輔色   | `#F5F0E6` 米白（茶紙）    |
| 強調   | `#C9A961` 燙金            |
| 標題字 | Noto Serif TC（思源宋體） |
| 內文字 | Noto Sans TC（思源黑體）  |
| 風格   | 東方禪風、留白美學        |

---

## 🚀 部署（Cloudflare Pages，手動）

> ⚠️ **重要**：此 Pages 專案為手動部署（Git Provider: No），**push 不會自動上線**。
> 每次改動後除了 `git push`，還必須執行以下指令才會更新線上網站：

```bash
# 1. 提交並推送
git add .
git commit -m "..."
git push

# 2. 手動部署到 Cloudflare Pages（production）
npx wrangler pages deploy . --project-name tao-tea-house --branch main
```

部署完成後，以 `https://tao-tea-house.pages.dev` 開頭會出現「Deployment complete」與預覽網址即成功（預覽網址僅供檢查，正式網址不受影響）。

---

## 🔑 後台與 API

- **後台網址**：`https://tao-tea-house.pages.dev/admin/`
- **登入**：Email + 密碼（後台可變更密碼）
- **API**：`https://tao-tea-house-api.rock903400.workers.dev`（登入 cookie 驗證）
- **重灌種子資料**（會覆蓋後台所有內容，請先確認）：

```bash
$env:TTH_PASSWORD="你的後台密碼"   # PowerShell
node backend/scripts/seed-api.mjs
```

- **Worker 部屬**（修改 backend 後）：

```bash
npx wrangler deploy --config backend/wrangler.toml
```

---

## 🗺 地圖嵌入（2026-08 修復）

**問題**：舊寫法 `google.com/maps?q=...&output=embed` 的 301 回應帶 `X-Frame-Options: SAMEORIGIN`，
被 LINE 內建瀏覽器阻擋 → `net::ERR_BLOCKED_BY_RESPONSE`「網頁無法使用」。

**修復**：改用 Google Maps 官方嵌入網址 `google.com/maps/embed?pb=...`（200 OK、無 X-Frame-Options，LINE 可正常顯示）。

**更換地圖步驟**：

1. 電腦開啟 Google Maps → 搜尋店址 → 「分享」→「嵌入地圖」→ 複製 `https://www.google.com/maps/embed?pb=...` 網址
2. 登入後台 → 「📞 聯絡資訊」→「地圖嵌入網址」欄位貼上 → 儲存
3. 若需同時更新靜態 fallback（SEO/API 離線時用），改 `index.html` 中 `<iframe src>` 與 `backend/scripts/seed-api.mjs` 的 `map_query`

> 後台欄位只接受完整網址（`http` 開頭），舊格式關鍵字會被 live.js 忽略並保留靜態地圖。

---

## ✏️ 日後維護

### 新增課程／修改課程

登入後台 → 「📚 課程」→ 新增/編輯，即時生效（live.js 自動帶入首頁與報名頁）。

### 查看報名

後台 → 「📋 報名」分頁，可看名單與報名時間。

### 更換圖片

後台各分頁上傳（>400KB 會自動壓縮）；或直接覆蓋 `assets/` 對應檔名，**保持檔名一致**就不用改 HTML。

### 改聯絡資訊

後台 → 「📞 聯絡資訊」直接改即可（地址、電話、FB、營業時間、地圖網址）。

---

## 📞 聯絡資訊（內建於網站）

| 項目    | 內容                                                   |
| ------- | ------------------------------------------------------ |
| 📞 電話 | 0919-897-351                                           |
| 📍 地址 | 台南市新營區三民路92-2號 2樓（辻間創生聚落 B3棟 2樓）  |
| 👍 FB   | https://www.facebook.com/profile.php?id=61585885331413 |

---

## 🌟 功能特色

- ✅ 手機優先 RWD 響應式設計
- ✅ 東方禪風視覺系統
- ✅ 滾動淡入動畫（IntersectionObserver）
- ✅ 作品 Lightbox 點擊放大
- ✅ 漢堡選單（手機）
- ✅ 浮動客服按鈕（電話 + FB）
- ✅ 手機底部 Sticky CTA
- ✅ **自建報名系統**（modal + API + 後台報名分頁，含 rate limit 與 XSS 防護）
- ✅ **管理後台**（課程/師資/參展/媒體/服務/作品/聯絡資訊 CRUD）
- ✅ **動態內容**（live.js 從 API 載入，離線時保留靜態 SEO fallback）
- ✅ Google Maps 官方嵌入（LINE 內建瀏覽器相容）
- ✅ SEO 結構化資料（Schema.org EducationalOrganization + Course）
- ✅ Open Graph 社群分享優化
- ✅ Sitemap.xml + robots.txt
- ✅ Canonical URL
- ✅ 全圖片 loading="lazy" 加快載入

---

## 🛠 技術棧

- HTML5（語意化標籤）
- 純 CSS3（無框架，方便維護）
- 原生 JavaScript（無 jQuery 等依賴）
- Cloudflare Workers + D1（後端 API）
- Cloudflare Pages（部署）
- Google Fonts（Noto Serif/Sans TC）

---

© 2025 陶茶雅舍 Tao · Tea · Art House
