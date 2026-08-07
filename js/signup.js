/* ============================================================
   陶茶雅舍 - 報名表單 Modal
   點擊 .signup-open 開啟報名彈窗，送出至 Worker API
   ============================================================ */

(function () {
  "use strict";

  var API_BASE = "https://tao-tea-house-api.rock903400.workers.dev";

  /* 靜態後備（API 無法連線時使用）；有 API 資料時以 live.js 存的 window.__COURSES__ 優先 */
  var COURSE_INFO = {
    識茶學體驗課: { fee: "$1,000", schedule: "8/9（日）下午 13:00～17:00" },
    緞泥手捏陶藝課: { fee: "$8,000", schedule: "8/29 起週六日・共 12 堂" },
  };

  function shortDate(s) {
    var m = String(s || "").match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return +m[2] + "/" + +m[3] + String(s).replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, "");
    return String(s || "");
  }

  /* 依課程名稱從後台資料取得資訊；找不到才用靜態後備 */
  function courseInfo(course) {
    var list = (typeof window !== "undefined" && window.__COURSES__) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].title === course) {
        return {
          fee: list[i].fee || (COURSE_INFO[course] && COURSE_INFO[course].fee),
          schedule:
            shortDate(list[i].date) || (COURSE_INFO[course] && COURSE_INFO[course].schedule),
        };
      }
    }
    return COURSE_INFO[course];
  }

  var bg = null;
  var body = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formHtml(course) {
    var info = courseInfo(course);
    var options = "";
    for (var i = 1; i <= 6; i++) {
      options +=
        '<option value="' + i + '"' + (i === 1 ? " selected" : "") + ">" + i + " 人</option>";
    }
    return (
      '<h3 class="signup-modal__title">課程報名</h3>' +
      '<p class="signup-modal__course">' +
      esc(course) +
      (info ? "<span>" + esc(info.fee) + "・" + esc(info.schedule) + "</span>" : "") +
      "</p>" +
      '<form class="signup-form" novalidate>' +
      '<input type="hidden" name="course" value="' +
      esc(course) +
      '">' +
      '<div class="signup-hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>' +
      '<label class="signup-form__field">姓名 *<input type="text" name="name" required maxlength="30" placeholder="您的姓名"></label>' +
      '<label class="signup-form__field">手機 *<input type="text" name="phone" required inputmode="tel" maxlength="20" placeholder="0912-345-678"></label>' +
      '<label class="signup-form__field">Email<input type="email" name="email" maxlength="80" placeholder="（選填）"></label>' +
      '<label class="signup-form__field">人數<select name="adults">' +
      options +
      "</select></label>" +
      '<label class="signup-form__field">備註<textarea name="note" rows="3" maxlength="200" placeholder="（選填，如想了解的其他資訊）"></textarea></label>' +
      '<p class="signup-form__err" hidden></p>' +
      '<button type="submit" class="btn btn--primary signup-form__submit">送出報名</button>' +
      "</form>" +
      '<p class="signup-modal__hint">送出後我們會以電話或 FB 訊息與你聯繫確認</p>'
    );
  }

  function doneHtml(course) {
    return (
      '<div class="signup-done">' +
      '<div class="signup-done__icon">✅</div>' +
      '<h3 class="signup-modal__title">報名已送出</h3>' +
      "<p>已收到你對「" +
      esc(course) +
      "」的報名，我們會盡快與你聯繫確認。</p>" +
      '<p class="signup-modal__hint">如有疑問歡迎來電 <strong>0919-897-351</strong></p>' +
      '<button type="button" class="btn btn--ghost signup-done__close">關閉</button>' +
      "</div>"
    );
  }

  function openModal(course) {
    if (!bg) build();
    body.innerHTML = formHtml(course);
    bg.hidden = false;
    document.body.style.overflow = "hidden";
    var first = body.querySelector("input[name='name']");
    if (first) first.focus();
  }

  function closeModal() {
    if (!bg) return;
    bg.hidden = true;
    document.body.style.overflow = "";
  }

  function build() {
    bg = document.createElement("div");
    bg.className = "signup-modal-bg";
    bg.hidden = true;
    bg.innerHTML =
      '<div class="signup-modal" role="dialog" aria-modal="true" aria-label="課程報名表單">' +
      '<button type="button" class="signup-modal__close" aria-label="關閉">✕</button>' +
      '<div class="signup-modal__body"></div></div>';
    body = bg.querySelector(".signup-modal__body");
    document.body.appendChild(bg);

    bg.addEventListener("click", function (e) {
      if (e.target === bg) closeModal();
    });
    bg.querySelector(".signup-modal__close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !bg.hidden) closeModal();
    });
  }

  /* 點擊任何 .signup-open 開啟報名（事件委派） */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".signup-open") : null;
    if (!btn) return;
    e.preventDefault();
    openModal(btn.dataset.course || btn.getAttribute("data-course") || "");
  });

  /* 送出表單 */
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList.contains("signup-form")) return;
    e.preventDefault();

    var err = form.querySelector(".signup-form__err");
    var submitBtn = form.querySelector(".signup-form__submit");
    var fields = {};
    form.querySelectorAll("[name]").forEach(function (el) {
      fields[el.name] = el.value.trim();
    });

    var msg = "";
    if (!fields.course) msg = "請選擇課程";
    else if (!fields.name) msg = "請填寫姓名";
    else if (!fields.phone) msg = "請填寫手機號碼";
    else if (!/^[0-9+\-()\s]{7,20}$/.test(fields.phone)) msg = "手機號碼格式不正確";
    else if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      msg = "Email 格式不正確";

    if (msg) {
      err.textContent = msg;
      err.hidden = false;
      return;
    }

    err.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "送出中…";

    fetch(API_BASE + "/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok || !j.ok) throw new Error(j.error || "送出失敗，請稍後再試");
          return j;
        });
      })
      .then(function () {
        body.innerHTML = doneHtml(fields.course);
        var doneBtn = body.querySelector(".signup-done__close");
        if (doneBtn) doneBtn.addEventListener("click", closeModal);
      })
      .catch(function (e) {
        var netMsg =
          e && e.message && e.message.indexOf("Failed to fetch") === -1
            ? e.message
            : "無法連線，請稍後再試或來電 0919-897-351";
        err.textContent = netMsg;
        err.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "送出報名";
      });
  });
})();
