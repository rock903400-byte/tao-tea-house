/**
 * 前端注入防護測試：API 資料被渲染成連結／HTML 時不能夾帶 javascript: 或跳出屬性。
 * js/live.js 是瀏覽器 IIFE，這裡用 node:vm 配一個假 DOM 直接執行它，攔截所有寫入。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

/* ---------- 假 DOM：記錄所有屬性寫入，任何方法呼叫都回傳新的假元素 ---------- */
function runLive(data) {
  const writes = [];
  const makeEl = (label) => {
    const store = {};
    return new Proxy(
      {},
      {
        set(_, prop, val) {
          store[prop] = val;
          writes.push({ label, prop: String(prop), value: String(val) });
          return true;
        },
        get(_, prop) {
          if (prop in store) return store[prop];
          if (prop === "classList")
            return { add() {}, remove() {}, contains: () => false, toggle() {} };
          if (prop === "style" || prop === "dataset") return {};
          if (prop === "length") return 0;
          if (prop === "children" || prop === "childNodes") return [];
          if (typeof prop === "symbol") return undefined;
          return () => makeEl(String(prop));
        },
      }
    );
  };
  const document = {
    readyState: "complete",
    addEventListener() {},
    querySelector: (sel) => makeEl(sel),
    querySelectorAll: () => [],
    getElementById: (id) => makeEl("#" + id),
    createElement: (tag) => makeEl(tag),
    body: makeEl("body"),
  };
  const sandbox = {
    document,
    window: {},
    location: { pathname: "/index.html", hash: "", search: "" },
    fetch: async () => ({ ok: true, json: async () => data }),
    console,
    setTimeout,
    URL,
  };
  vm.createContext(sandbox);
  vm.runInContext(read("js/live.js"), sandbox);
  return new Promise((resolve) => setTimeout(() => resolve(writes), 30));
}

const EVIL_LINKS = [
  "javascript:alert(1)",
  "JaVaScRiPt:alert(1)",
  "java\tscript:alert(1)",
  " \u0001javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
];

test("live.js：課程／媒體／聯絡資訊的連結欄位不會渲染出危險 scheme", async () => {
  for (const evil of EVIL_LINKS) {
    const writes = await runLive({
      courses: [{ id: 1, title: "課程", detail_url: evil, published: 1 }],
      media: [{ id: 1, type: "報導", title: "報導", link: evil }],
      teachers: [],
      exhibitions: [],
      services: [],
      works: [],
      settings: { phone: "0912345678", phone_href: evil, facebook: evil, address: "台中" },
    });
    assert.ok(writes.length > 0, "應該有渲染輸出");
    for (const w of writes) {
      assert.doesNotMatch(
        Array.from(w.value)
          .filter((ch) => ch.charCodeAt(0) > 32)
          .join(""),
        /(javascript|vbscript|data):/i,
        `${JSON.stringify(evil)} 出現在 ${w.label}.${w.prop}`
      );
    }
  }
});

test("live.js：正常連結（https、站內相對路徑、tel）保持原樣", async () => {
  const writes = await runLive({
    courses: [{ id: 1, title: "課程", detail_url: "course-tea.html", published: 1 }],
    media: [{ id: 1, type: "報導", title: "報導", link: "https://news.example.com/a?b=1&c=2" }],
    teachers: [],
    exhibitions: [],
    services: [],
    works: [],
    settings: {
      phone: "0912345678",
      phone_href: "tel:+886912345678",
      facebook: "https://www.facebook.com/x",
    },
  });
  const all = writes.map((w) => w.value).join("\n");
  assert.match(all, /href="course-tea\.html"/);
  assert.match(all, /href="https:\/\/news\.example\.com\/a\?b=1&amp;c=2"/);
  assert.match(all, /tel:\+886912345678/);
  assert.match(all, /https:\/\/www\.facebook\.com\/x/);
});

test("live.js：資料中的單引號與雙引號都被跳脫", async () => {
  const writes = await runLive({
    courses: [
      { id: 1, title: `x' onmouseover='alert(1)`, tag: `y" onclick="alert(1)`, published: 1 },
    ],
    media: [],
    teachers: [],
    exhibitions: [],
    services: [],
    works: [],
    settings: {},
  });
  const html = writes.map((w) => w.value).join("\n");
  assert.ok(html.includes("x&#39; onmouseover=&#39;alert(1)"));
  assert.ok(html.includes("y&quot; onclick=&quot;alert(1)"));
  assert.doesNotMatch(html, /onmouseover='/);
});

/* ---------- 後台 admin/index.html：抽出 esc / safeHref 直接測 ---------- */
function loadAdminHelpers() {
  const src = read("admin/index.html");
  const pick = (name) => {
    const m = src.match(new RegExp("^function " + name + "\\(.*$", "m"));
    assert.ok(m, "找不到 admin 的 " + name);
    return m[0];
  };
  return new Function(pick("esc") + "\n" + pick("safeHref") + "\nreturn { esc, safeHref };")();
}

test("admin：esc() 跳脫單引號，訪客姓名無法跳出 title='...' 屬性", () => {
  const { esc } = loadAdminHelpers();
  const evil = `x' onmouseover='alert(document.domain)`;
  const cell = "<td title='" + esc(evil) + "'>" + esc(evil) + "</td>";
  assert.doesNotMatch(cell, /title='[^']*'\s+onmouseover=/);
  assert.equal(esc(`a&b<c>"d'e`), "a&amp;b&lt;c&gt;&quot;d&#39;e");
});

test("admin：safeHref() 擋 javascript:/data: 但放行 https、相對路徑、mailto、tel", () => {
  const { safeHref } = loadAdminHelpers();
  for (const evil of EVIL_LINKS) assert.equal(safeHref(evil), "", JSON.stringify(evil));
  assert.equal(safeHref("https://a.example/x?y=1"), "https://a.example/x?y=1");
  assert.equal(safeHref("course-tea.html"), "course-tea.html");
  assert.equal(safeHref("mailto:a@b.co"), "mailto:a@b.co");
  assert.equal(safeHref("tel:+886912345678"), "tel:+886912345678");
  assert.equal(safeHref(""), "");
  assert.equal(safeHref(null), "");
});
