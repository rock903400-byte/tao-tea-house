# 陶茶雅舍 Tao · Tea · Art House

> 陶藝 × 品茶｜在泥與火之間，找回生活的溫度
> 台南新營・30 年手捏壺職人

品牌形象網＋識茶學體驗課報名頁，部署於 GitHub Pages。

---

## 📁 專案結構

```
陶茶雅舍/
├── index.html              # 品牌形象首頁（13 區塊）
├── course-tea.html         # 識茶學體驗課報名頁
├── css/
│   └── style.css           # 統一樣式（東方禪風）
├── js/
│   └── main.js             # 互動功能（漢堡選單、Lightbox、進度條、Timeline 折疊）
├── assets/                 # 12 張圖片（全英文檔名）
│   ├── logo.jpg            # 品牌 Logo（同時當 favicon）
│   ├── hero.jpg            # Hero 主視覺
│   ├── teachers.jpg        # 兩位老師合照
│   ├── tea-welcome.jpg     # 迎賓茶席
│   ├── class-tea.jpg       # 識茶學上課
│   ├── class-pottery.jpg   # 陶藝課上課
│   ├── student-1.jpg       # 學員實作
│   ├── student-2.jpg       # 個別指導
│   └── works-1~4.jpg       # 作品集 4 張
├── sitemap.xml             # SEO 站點地圖
├── robots.txt              # SEO 爬蟲指令
└── README.md
```

---

## 🎨 設計系統

| 項目 | 規格 |
|---|---|
| 主色 | `#2C4A3E` 墨綠（茶湯） |
| 輔色 | `#F5F0E6` 米白（茶紙） |
| 強調 | `#C9A961` 燙金 |
| 標題字 | Noto Serif TC（思源宋體） |
| 內文字 | Noto Sans TC（思源黑體） |
| 風格 | 東方禪風、留白美學 |

---

## 🚀 部署到 GitHub Pages

### 方法 A：網頁拖拉上傳（最快）

1. 登入 GitHub → 右上角 **＋** → **New repository**
2. Repository name 填：`tao-tea-house`（或自訂）
3. 設定為 **Public** → **Create repository**
4. 在 repo 頁面點 **uploading an existing file** 連結
5. 把整個專案資料夾的內容**全選拖拉**進去（包含 index.html、css/、js/、assets/）
6. 提交訊息填 `initial commit` → **Commit changes**
7. 進入 **Settings** → 左側 **Pages**
8. **Source** 選 `Deploy from a branch`
9. **Branch** 選 `main` / `root` → **Save**
10. 等 1-2 分鐘，重新整理就會看到網址：
    ```
    https://rock903400-byte.github.io/tao-tea-house/
    ```

### 方法 B：用 Git 指令（推薦長期維護）

```bash
# 1. 初始化
cd "C:\Users\user\Desktop\客戶專案\陶茶雅舍"
git init
git add .
git commit -m "feat: 陶茶雅舍形象網初次提交"

# 2. 連結 GitHub repo（先到 GitHub 建立空 repo）
git remote add origin https://github.com/rock903400-byte/tao-tea-house.git
git branch -M main
git push -u origin main

# 3. 到 GitHub repo → Settings → Pages → Source: main / root → Save
```

---

## ✏️ 日後維護

### 新增下一堂課（例如手捏壺體驗課）

1. 複製 `course-tea.html` → 改名為 `course-pottery.html`
2. 修改以下內容：
   - `<title>`、`<meta description>`
   - 課程名稱、日期、時間、費用、地點
   - 報名連結（換成新的 Google Form）
3. 在 `index.html` 的最新課程區（`#courses`）新增一張課程卡片
4. 重新 `git push` 即可更新

### 更新報名人數

進度條功能已內建於 `js/main.js`，如需顯示報名進度，請在 HTML 加入：

```html
<div data-progress data-enrolled="4" data-total="6">
  <div class="progress-bar__fill"></div>
  <p class="progress-bar__text"></p>
</div>
```

修改 `data-enrolled` 數字即可即時顯示。

### 更換圖片

直接覆蓋 `assets/` 對應檔名即可，**保持檔名一致**就不用改 HTML。

---

## 📞 聯絡資訊（內建於網站）

| 項目 | 內容 |
|---|---|
| 📞 電話 | 0919-897-351 |
| 📍 地址 | 台南市新營區三民路92-2號 2樓（辻間創生聚落 B3棟 2樓） |
| 👍 FB | https://www.facebook.com/profile.php?id=61585885331413 |
| 📝 報名 | https://forms.gle/DMLU44EgRqDFtvAA9 |

---

## 🌟 功能特色

- ✅ 手機優先 RWD 響應式設計
- ✅ 東方禪風視覺系統
- ✅ 滾動淡入動畫（IntersectionObserver）
- ✅ 作品 Lightbox 點擊放大
- ✅ 漢堡選單（手機）
- ✅ 浮動客服按鈕（電話 + FB）
- ✅ 手機底部 Sticky CTA
- ✅ **報名進度條**（動態顯示「已報名 X/6」與剩餘名額警示）
- ✅ **Timeline 參展經歷折疊**（預設顯示 6 筆，可展開全部 22 筆）
- ✅ **課程實況區**（4 張上課照片，提升信任感）
- ✅ Google Maps 嵌入
- ✅ SEO 結構化資料（Schema.org EducationalOrganization + Course）
- ✅ Open Graph 社群分享優化
- ✅ Sitemap.xml + robots.txt
- ✅ Canonical URL
- ✅ Favicon 與 apple-touch-icon
- ✅ 全圖片 loading="lazy" 加快載入

---

## 🛠 技術棧

- HTML5（語意化標籤）
- 純 CSS3（無框架，方便維護）
- 原生 JavaScript（無 jQuery 等依賴）
- Google Fonts（Noto Serif/Sans TC）
- 部署：GitHub Pages（免費、免後端）

---

© 2025 陶茶雅舍 Tao · Tea · Art House
