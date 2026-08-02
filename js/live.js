/* ============================================================
   陶茶雅舍 - 動態內容載入
   從 Cloudflare Worker API 載入內容，覆寫區塊內容。
   API 無法連線時保留原靜態內容（SEO fallback）。
   ============================================================ */

(function () {
  "use strict";

  var API_BASE = "https://tao-tea-house-api.rock903400.workers.dev";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* 圖片網址：後台上傳的 /img/ 開頭需接 API 網域；http 開頭直接用；其餘為站內相對路徑 */
  function imgUrl(src) {
    if (!src) return "";
    if (src.indexOf("/img/") === 0) return API_BASE + src;
    if (src.indexOf("http") === 0) return src;
    return src;
  }

  function shortDate(s) {
    var m = String(s || "").match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return +m[2] + "/" + +m[3] + String(s).replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, "");
    return String(s || "");
  }

  /* ---------- 課程卡片 ---------- */
  function renderCourse(course) {
    var img = imgUrl(course.image);
    var pic = img
      ? '<picture><img src="' +
        esc(img) +
        '" alt="' +
        esc(course.title) +
        ' - 陶茶雅舍" loading="lazy" width="800" height="450" decoding="async"></picture>'
      : "";
    var subtitle = course.subtitle
      ? '<br><span style="font-size:0.85rem;color:var(--color-soft);font-weight:normal;">（' +
        esc(course.subtitle) +
        "）</span>"
      : "";
    var fee = String(course.fee || "").replace(
      /^(\$[\d,]+)\s*\/\s*人$/,
      '<strong style="color:var(--color-accent);font-size:1.15rem;">$1</strong> ／ 人'
    );

    var meta = "";
    if (course.date) meta += "<dt>📅 日期</dt><dd>" + esc(shortDate(course.date)) + "</dd>";
    if (course.time) meta += "<dt>🕐 時間</dt><dd>" + esc(course.time) + "</dd>";
    if (course.capacity) meta += "<dt>👥 名額</dt><dd>" + esc(course.capacity) + "</dd>";
    if (course.fee) meta += "<dt>💰 費用</dt><dd>" + fee + "</dd>";
    if (course.bonus) meta += "<dt>🎁 加碼</dt><dd>" + esc(course.bonus) + "</dd>";
    if (course.location)
      meta += "<dt>📍 地點</dt><dd>" + esc(course.location.split("（")[0]) + "</dd>";

    var signup = course.signup_url
      ? '<a href="' +
        esc(course.signup_url) +
        '" target="_blank" rel="noopener" class="btn btn--primary">⬇️ 立即報名</a>'
      : "";
    return (
      '<article class="course-card fade-in visible">' +
      '<div class="course-card__image">' +
      (course.tag ? '<span class="course-card__badge">' + esc(course.tag) + "</span>" : "") +
      pic +
      "</div>" +
      '<div class="course-card__body">' +
      (course.tag ? '<p class="course-card__tag">✦ ' + esc(course.tag) + "</p>" : "") +
      '<h3 class="course-card__title">' +
      esc(course.title) +
      subtitle +
      "</h3>" +
      (course.description
        ? '<p class="course-card__desc">' + esc(course.description) + "</p>"
        : "") +
      (meta ? '<dl class="course-card__meta">' + meta + "</dl>" : "") +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
      signup +
      '<a href="course-tea.html" class="btn btn--ghost" style="color:var(--color-primary);border-color:var(--color-primary);">查看詳情 →</a>' +
      "</div></div></article>"
    );
  }

  /* ---------- 師資 ---------- */
  function renderTeacher(t) {
    return (
      '<div class="teacher-info fade-in visible">' +
      '<h3 class="teacher-info__name">' +
      esc(t.name) +
      "</h3>" +
      (t.title ? '<p class="teacher-info__title">' + esc(t.title) + "</p>" : "") +
      (t.bio
        ? '<p class="teacher-info__bio">' +
          esc(t.bio).replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, "<strong>$1</strong>") +
          "</p>"
        : "") +
      "</div>"
    );
  }

  /* ---------- 服務 ---------- */
  function renderService(s) {
    return (
      '<div class="service fade-in visible">' +
      (s.icon ? '<span class="service__icon">' + esc(s.icon) + "</span>" : "") +
      '<h3 class="service__name">' +
      esc(s.name) +
      "</h3>" +
      (s.description ? '<p class="service__desc">' + esc(s.description) + "</p>" : "") +
      "</div>"
    );
  }

  /* ---------- 作品 ---------- */
  function renderWork(w) {
    var img = imgUrl(w.image);
    if (!img) return "";
    return (
      '<div class="gallery__item fade-in visible">' +
      '<picture><img src="' +
      esc(img) +
      '" alt="' +
      esc(w.caption || "陶茶雅舍手作陶藝作品") +
      '" loading="lazy" width="800" height="600" decoding="async">' +
      "</picture></div>"
    );
  }

  /* ---------- 媒體 ---------- */
  function renderMedia(m) {
    var icon = m.type && m.type.indexOf("影音") > -1 ? "📺" : "📰";
    var linkText = m.type && m.type.indexOf("影音") > -1 ? "觀看影片 →" : "閱讀報導 →";
    return (
      '<article class="media-card fade-in visible">' +
      '<div class="media-card__type">' +
      icon +
      " " +
      esc(m.type) +
      "</div>" +
      '<div class="media-card__body">' +
      '<h3 class="media-card__title">' +
      esc(m.title) +
      "</h3>" +
      (m.description ? '<p class="media-card__desc">' + esc(m.description) + "</p>" : "") +
      (m.link
        ? '<a href="' +
          esc(m.link) +
          '" target="_blank" rel="noopener" class="media-card__link">' +
          linkText +
          "</a>"
        : "") +
      "</div></article>"
    );
  }

  /* ---------- 聯絡資訊 ---------- */
  function renderContact(s) {
    if (!s) return;
    var contact = document.querySelector(".contact__info");
    if (contact && (s.address || s.phone || s.facebook || s.hours)) {
      contact.innerHTML =
        '<div class="contact__item"><div class="contact__icon">📍</div><div>' +
        '<p class="contact__label">ADDRESS</p>' +
        '<p class="contact__value">' +
        esc(s.address || "").replace("\n", "<br>") +
        "</p></div></div>" +
        '<div class="contact__item"><div class="contact__icon">📞</div><div>' +
        '<p class="contact__label">PHONE</p>' +
        '<p class="contact__value"><a href="' +
        esc(s.phone_href || "tel:" + s.phone) +
        '">' +
        esc(s.phone) +
        "</a></p></div></div>" +
        '<div class="contact__item"><div class="contact__icon">👍</div><div>' +
        '<p class="contact__label">FACEBOOK</p>' +
        '<p class="contact__value"><a href="' +
        esc(s.facebook) +
        '" target="_blank" rel="noopener">陶茶雅舍 粉絲專頁｜FB 訊息聯繫</a></p></div></div>' +
        '<div class="contact__item"><div class="contact__icon">🕐</div><div>' +
        '<p class="contact__label">OPEN HOURS</p>' +
        '<p class="contact__value">' +
        esc(s.hours).replace("\n", "<br>") +
        "</p></div></div>";
    }

    /* 地圖 */
    if (s.map_query) {
      var iframe = document.querySelector(".contact__map iframe");
      if (iframe)
        iframe.src =
          "https://www.google.com/maps?q=" + encodeURIComponent(s.map_query) + "&output=embed";
    }

    /* Footer 聯絡資訊 */
    var footPhone = document.querySelector('.footer__col a[href^="tel:"]');
    if (footPhone && s.phone) {
      footPhone.href = s.phone_href || "tel:" + s.phone;
      footPhone.textContent = s.phone;
    }
    var footAddr = document.querySelector(".footer__col li:not(:first-child):not(:last-child)");
    if (footAddr && s.address_short) footAddr.innerHTML = "📍 " + esc(s.address_short);

    /* Floating 按鈕 */
    var floatPhone = document.querySelector(".floating__btn--phone");
    if (floatPhone && s.phone) floatPhone.href = s.phone_href || "tel:" + s.phone;
    var floatFb = document.querySelector(".floating__btn--fb");
    if (floatFb && s.facebook) floatFb.href = s.facebook;
  }

  /* ---------- 課程詳情頁（course-tea.html） ---------- */
  function renderCoursePage(course) {
    if (!course || !document.querySelector(".signup-card")) return;

    /* Page Hero */
    var hero = document.querySelector(".page-hero__content");
    if (hero) {
      var tagEl = hero.querySelector("p");
      var h1 = hero.querySelector("h1");
      var sub = hero.querySelector(".page-hero__subtitle");
      if (tagEl && course.tag) tagEl.innerHTML = "✦ " + esc(course.tag);
      if (h1) {
        var subtitleHtml = course.subtitle
          ? '<br><span style="font-size:0.7em;color:var(--color-accent);">（' +
            esc(course.subtitle) +
            " ✦）</span>"
          : "";
        h1.innerHTML = esc(course.title) + subtitleHtml;
      }
      if (sub && course.description) sub.textContent = course.description;
    }

    /* 報名卡 */
    var card = document.querySelector(".signup-card");
    var title = card.querySelector(".signup-card__title");
    if (title && course.title) title.innerHTML = "✨ " + esc(course.title) + " ✨";
    var price = card.querySelector(".signup-card__price");
    if (price && course.fee) {
      var feeClean = String(course.fee).replace(" / 人", "");
      var priceSmall = course.time ? "4 小時・小班精緻" : "小班精緻";
      price.innerHTML = feeClean + "<small>" + priceSmall + "</small>";
    }
    var meta = card.querySelector(".signup-card__meta");
    if (meta) {
      var html = "";
      if (course.date) html += "<dt>📅 日期</dt><dd><strong>" + esc(course.date) + "</strong></dd>";
      if (course.time)
        html += "<dt>🕐 時間</dt><dd>" + esc(course.time).replace("\n", "<br>") + "</dd>";
      if (course.capacity)
        html +=
          '<dt>👥 名額</dt><dd><strong style="color:var(--color-accent);">' +
          esc(course.capacity) +
          "</strong>　小班精緻教學</dd>";
      if (course.fee) html += "<dt>💰 費用</dt><dd>" + esc(course.fee) + "</dd>";
      if (course.bonus) html += "<dt>🎁 加碼</dt><dd>" + esc(course.bonus) + "</dd>";
      if (course.location)
        html += "<dt>📍 地點</dt><dd>" + esc(course.location).replace("\n", "<br>") + "</dd>";
      if (course.signup_url)
        html +=
          '<dt>📝 報名</dt><dd><a href="' +
          esc(course.signup_url) +
          '" target="_blank" rel="noopener" style="color:var(--color-primary);">點此填寫報名表 →</a></dd>';
      meta.innerHTML = html;
    }

    /* 報名按鈕 */
    if (course.signup_url) {
      document
        .querySelectorAll(".signup-card a.btn--primary, .section--dark a.btn--primary, .sticky-cta")
        .forEach(function (a) {
          a.href = course.signup_url;
        });
    }

    /* 詢問電話 */
    if (course.date) {
      var cta = document.querySelector(".sticky-cta");
      if (cta && course.fee) {
        cta.innerHTML =
          "立即報名 " +
          esc(course.title) +
          " <span>" +
          String(course.fee).replace(" / 人", "") +
          "</span> →";
      }
    }
  }

  /* ---------- 主流程 ---------- */
  function apply(data) {
    /* 課程 */
    if (data.courses && data.courses.length) {
      var courseWrap = document.getElementById("courses-list");
      if (courseWrap) courseWrap.innerHTML = data.courses.map(renderCourse).join("");
    }

    /* 師資 */
    if (data.teachers && data.teachers.length) {
      var teacherGrid = document.querySelector(".teachers-couple__grid");
      if (teacherGrid) teacherGrid.innerHTML = data.teachers.map(renderTeacher).join("");
    }

    /* 服務 */
    if (data.services && data.services.length) {
      var serviceGrid = document.querySelector(".services__grid");
      if (serviceGrid) serviceGrid.innerHTML = data.services.map(renderService).join("");
    }

    /* 作品 */
    if (data.works && data.works.length) {
      var galleryGrid = document.querySelector(".gallery__grid");
      if (galleryGrid) galleryGrid.innerHTML = data.works.map(renderWork).join("");
    }

    /* 參展時間軸 */
    if (data.exhibitions && data.exhibitions.length) {
      var timeline = document.getElementById("timeline");
      if (timeline) {
        var items = data.exhibitions.map(function (e, i) {
          var extra = i >= 6 ? " timeline__item--extra" : "";
          return (
            '<div class="timeline__item' +
            extra +
            '"><span class="timeline__year">' +
            esc(e.year) +
            "</span>" +
            esc(e.title) +
            "</div>"
          );
        });
        timeline.innerHTML = items.join("");
        var btn = document.querySelector(".timeline-toggle");
        if (btn) btn.textContent = "展開全部 " + data.exhibitions.length + " 筆經歷 ↓";
      }
    }

    /* 媒體 */
    if (data.media && data.media.length) {
      var mediaGrid = document.querySelector(".media__grid");
      if (mediaGrid) mediaGrid.innerHTML = data.media.map(renderMedia).join("");
    }

    /* 聯絡資訊 */
    if (data.settings) renderContact(data.settings);

    /* 課程詳情頁（若存在對應元素） */
    if (data.courses && data.courses.length) {
      renderCoursePage(data.courses[0]);
    }

    /* 重新初始化 lightbox（動態產生的作品） */
    if (window.__reinitGallery) window.__reinitGallery();
  }

  /* 頁面載入後抓資料 */
  function load() {
    fetch(API_BASE + "/api/data")
      .then(function (r) {
        if (!r.ok) throw new Error("API " + r.status);
        return r.json();
      })
      .then(apply)
      .catch(function () {
        /* 保留靜態內容，不處理 */
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
