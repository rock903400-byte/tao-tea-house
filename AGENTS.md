# AGENTS.md — 陶茶雅舍

## 專案性質

靜態 HTML 網站（無框架、無打包工具、無 package.json）。修改後直接 commit + push 到 `main` 即可部署。

## 部署

- **GitHub Pages**，source 為 `main` branch / root
- push 到 `main` 後 1~2 分鐘自動更新
- 線上網址：`https://rock903400-byte.github.io/tao-tea-house/`

## 結構

| 路徑 | 用途 |
|---|---|
| `index.html` | 品牌形象首頁（13 區塊） |
| `course-tea.html` | 識茶學體驗課報名頁 |
| `css/style.css` | 統一樣式（東方禪風，CSS 變數定義設計系統） |
| `js/main.js` | 互動功能（單一 IIFE，7 個模組） |
| `assets/` | 圖片（JPG + WebP 雙格式） |

## 設計系統（CSS 變數）

在 `css/style.css` 的 `:root` 中定義。修改顏色/字型請改變數，不要硬編碼：

- 主色 `--color-primary: #2C4A3E`（墨綠）
- 強調 `--color-accent: #C9A961`（燙金）
- 標題字 `--font-heading: Noto Serif TC`
- 內文字 `--font-body: Noto Sans TC`

## Commit 規範

使用 Conventional Commits：`feat:`, `fix:`, `chore:`, `perf:` 等。訊息以繁體中文撰寫。

## 注意事項

- **無自動化測試**：無 lint、typecheck、test 指令。修改後需手動在瀏覽器驗證。
- **無 Node/npm 依賴**：直接編輯 HTML/CSS/JS 即可。
- **圖片替換**：覆蓋 `assets/` 同檔名檔案即可，不需改 HTML。
- **新增課程頁**：複製 `course-tea.html` 為新檔名，改標題/內容/Google Form 連結，再於 `index.html` 的 `#courses` 區塊加卡片。
- **報名進度條**：`main.js` 內建（`[data-progress]`），但首頁目前未使用此元件，僅於 `course-tea.html` 或手動嵌入時生效。
- **SEO 已設定**：`sitemap.xml`、`robots.txt`、Schema.org 結構化資料、OG meta。修改 `<title>` 或 `<meta description>` 時記得同步更新 `sitemap.xml` 的 `<lastmod>`。
- **全站繁體中文**：`lang="zh-Hant"`，內容全部使用繁體中文。
