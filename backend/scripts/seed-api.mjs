/* 透過 Worker API 匯入種子資料（避免 wrangler 在 Windows 的編碼問題） */
const API = "https://tao-tea-house-api.rock903400.workers.dev";
const EMAIL = "tcbmas5116@yahoo.com.tw";
const PASSWORD = process.env.TTH_PASSWORD;

if (!PASSWORD) {
  console.error("請設定環境變數 TTH_PASSWORD");
  process.exit(1);
}

const seed = {
  courses: [
    {
      title: "識茶學體驗課",
      tag: "茶藝入門體驗",
      subtitle: "有保固的茶藝教學",
      description: "你不是不會泡茶，只是少了一個關鍵。用最簡單的方法，喝懂一杯好茶。",
      date: "2026-08-09（日）",
      time: "下午 13:00～17:00（共 4 小時）",
      fee: "$1,000 / 人",
      capacity: "限 6 人",
      bonus: "報名即送 茶葉一包",
      location: "台南市新營區三民路92-2號 2樓（辻間創生聚落 B3棟 2樓）",
      signup_url: "https://forms.gle/DMLU44EgRqDFtvAA9",
      detail_url: "course-tea.html",
      image: "assets/class-tea.jpg",
      published: 1,
      sort_order: 0,
    },
    {
      title: "緞泥手捏陶藝課",
      tag: "陶藝入門",
      subtitle: "由淺入深完整教學",
      description:
        "12 堂完整課程，從練土、塑形到燒窯，由田清標老師親授手捏陶藝，讓每一次手捏都成為獨一無二的作品。",
      date: "2026-08-30（日）起，每週日共 12 堂",
      time: "每堂 4 小時",
      fee: "$8,000 / 人",
      capacity: "小班教學",
      bonus: "含陶土與燒窯費用",
      location: "台南市新營區三民路92-2號 2樓（辻間創生聚落 B3棟 2樓）",
      signup_url: "",
      detail_url: "course-pottery.html",
      image: "assets/pottery-set.jpg",
      published: 1,
      sort_order: 1,
    },
  ],
  teachers: [
    {
      name: "田清標",
      title: "壺藝達人｜創辦人",
      bio: "從事手捏茶壺創作已 30 餘年，曾於梅嶺美術館、台南文化中心、嘉義文化中心等全台多處聯展，作品深受收藏家青睞。2025 年與妻子共同創辦陶茶雅舍，致力將手捏壺工藝傳承下一代。",
      image: "assets/teachers.jpg",
      sort_order: 0,
    },
    {
      name: "江秝笙",
      title: "壺藝達人｜高級茶藝師",
      bio: "30 餘年陶藝師資歷，並持有高級茶藝師證照，將陶藝與茶藝兩門工藝融會貫通。夫妻倆攜手創作、共同授課，讓每一件作品、每一堂課，都充滿手作的溫度與茶的靜謐。",
      image: "assets/teachers.jpg",
      sort_order: 1,
    },
  ],
  exhibitions: [
    { year: "114 年", title: "嘉義民雄酒廠「陶韻酒香展壺器」會員聯展", sort_order: 0 },
    { year: "113 年", title: "梅山文教基金會「夫妻創作聯展」", sort_order: 1 },
    { year: "112 年", title: "嘉義市文化中心會員聯展", sort_order: 2 },
    { year: "111 年", title: "新營文化中心「唯心 2021」會員聯展", sort_order: 3 },
    { year: "110 年", title: "新營文化中心「唯一 2021」會員聯展", sort_order: 4 },
    { year: "110 年", title: "梅嶺美術館會員聯展", sort_order: 5 },
    { year: "109 年", title: "竹崎文化藝術基金會「七金釵創作聯展」", sort_order: 6 },
    { year: "108 年", title: "梅嶺美術館會員聯展", sort_order: 7 },
    { year: "108 年", title: "南投縣文化中心會員聯展", sort_order: 8 },
    { year: "107 年", title: "彰化藝術館「茶器」聯展", sort_order: 9 },
    { year: "107 年", title: "梅嶺美術館會員聯展", sort_order: 10 },
    { year: "107 年", title: "歸仁文化中心「茶侶」會員聯展", sort_order: 11 },
    { year: "106 年", title: "梅嶺美術館會員聯展", sort_order: 12 },
    { year: "106 年", title: "雲林縣文化中心「茶器之美」聯展", sort_order: 13 },
    { year: "105 年", title: "歸仁文化中心「跨越傳統創新意」", sort_order: 14 },
    { year: "105 年", title: "梅嶺美術館「桃城手捏壺學會會員聯展」", sort_order: 15 },
    { year: "105 年", title: "新營文化中心「事茶─壺的藝術創作聯展」", sort_order: 16 },
    { year: "103 年", title: "台南市歸仁文化中心聯展", sort_order: 17 },
    { year: "103 年", title: "新竹市文化中心聯展", sort_order: 18 },
    { year: "103 年", title: "台南市新營文化中心聯展", sort_order: 19 },
    { year: "102 年", title: "嘉義縣梅嶺美術館聯展", sort_order: 20 },
    { year: "100 年", title: "梅山文教基金會「夫妻百年百壺展」", sort_order: 21 },
  ],
  media: [
    {
      type: "影音報導",
      title: "陶茶雅舍｜介紹影片",
      description:
        "陶茶雅舍品牌介紹影片，帶你走進田清標老師與江秝笙老師的手捏壺世界，感受泥與火交織的工藝之美。",
      link: "https://www.facebook.com/reel/895257912838001",
      sort_order: 0,
    },
    {
      type: "新聞專訪",
      title: "田清標夫婦手捏陶壺",
      description:
        "TNN 新聞專題報導，田清標老師與江秝笙老師夫妻聯手創作手捏壺的動人故事，以及 30 餘年陶藝生涯的點滴。",
      link: "https://news.tnn.tw/news.html?c=7&id=34006",
      sort_order: 1,
    },
    {
      type: "新聞專訪",
      title: "清潔隊長巧手 變身陶藝師",
      description: "Yahoo 新聞詳細報導田老師的創作歷程，從公職退而不休，投入手捏壺藝術的精彩人生。",
      link: "https://tw.news.yahoo.com/清潔隊長巧手-變身陶藝師-215005627.html",
      sort_order: 2,
    },
  ],
  services: [
    {
      icon: "🏺",
      name: "陶藝教學",
      description: "手捏壺、手作陶器課程，從入門到進階，由 30 年資歷職人親自指導。",
      sort_order: 0,
    },
    {
      icon: "🍵",
      name: "茶藝教學",
      description: "識茶學、茶席禮儀、水溫比例掌握，帶你喝懂一杯好茶的實學。",
      sort_order: 1,
    },
    {
      icon: "🌿",
      name: "高山茶販售",
      description: "嚴選高山茶葉，從產地到茶席，把山頭氣與茶湯香帶進你的日常。",
      sort_order: 2,
    },
    {
      icon: "✋",
      name: "手作陶藝品",
      description: "手捏壺、茶器、生活陶藝選品，每件都是獨一無二的手作藝術。",
      sort_order: 3,
    },
  ],
  works: [
    {
      image: "assets/works-1.jpg",
      caption: "田清標老師手捏茶壺作品 - 桃城手捏壺學會聯展",
      sort_order: 0,
    },
    {
      image: "assets/works-2.jpg",
      caption: "手捏壺陶藝作品 - 田清標老師與江秝笙老師創作",
      sort_order: 1,
    },
    { image: "assets/works-3.jpg", caption: "手捏茶壺作品 - 南投文化中心參展陶藝", sort_order: 2 },
    { image: "assets/works-4.jpg", caption: "手作陶藝壺器 - 台南陶藝教室學員創作", sort_order: 3 },
  ],
  settings: {
    address: "台南市新營區三民路92-2號 2樓（辻間創生聚落 B3棟 2樓）",
    address_short: "新營區三民路92-2號 2樓",
    phone: "0919-897-351",
    phone_href: "tel:+886919897351",
    email: "tcbmas5116@yahoo.com.tw",
    facebook: "https://www.facebook.com/profile.php?id=61585885331413",
    hours: "採預約制，歡迎來電或 FB 訊息聯繫安排參觀",
    map_query: "台南市新營區三民路92-2號",
  },
};

async function main() {
  const login = await fetch(API + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const lj = await login.json();
  if (!lj.ok) {
    console.error("登入失敗:", lj.error);
    process.exit(1);
  }
  const cookie = login.headers.get("set-cookie").split(";")[0];
  console.log("登入成功:", lj.name);

  const headers = { "Content-Type": "application/json", Cookie: cookie };

  for (const [res, items] of Object.entries(seed)) {
    if (res === "settings") continue;

    /* 抓取現有資料（依 title 比對，避免重複匯入） */
    let existing = [];
    const existingRes = await fetch(API + "/api/" + res, { headers: { Cookie: cookie } });
    if (existingRes.ok) {
      const j = await existingRes.json();
      if (Array.isArray(j)) existing = j;
    }

    for (const item of items) {
      const key = item.title || item.name || item.year || item.image || "";
      const found = existing.find(
        (x) => String(x.title || x.name || x.year || x.image || "") === String(key)
      );
      const url = found ? API + "/api/" + res + "/" + found.id : API + "/api/" + res;
      const r = await fetch(url, {
        method: found ? "PUT" : "POST",
        headers,
        body: JSON.stringify(item),
      });
      const j = await r.json();
      if (!j.ok) {
        console.error("匯入失敗", res, JSON.stringify(item), j);
        process.exit(1);
      }
      console.log(found ? "⇅ 更新" : "✓ 新增", res, "-", key);
    }
  }

  const r = await fetch(API + "/api/settings", {
    method: "PUT",
    headers,
    body: JSON.stringify(seed.settings),
  });
  const j = await r.json();
  if (!j.ok) {
    console.error("匯入 settings 失敗", j);
    process.exit(1);
  }
  console.log("✓ settings - 聯絡資訊");

  console.log("全部匯入完成");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
