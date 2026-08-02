import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../backend/src/worker.js";

const SCHEMA = readFileSync(new URL("../backend/schema.sql", import.meta.url), "utf8");
const EMAIL = "admin@taoteahouse.test";
const PASS = "secret-pass-123";

/* ---------- 基礎設施 ---------- */

function createD1(db) {
  function prepare(sql) {
    const stmt = db.prepare(sql);
    const bound = [];
    return {
      bind(...args) {
        bound.push(...args);
        return this;
      },
      async first() {
        const row = stmt.get(...bound);
        return row === undefined ? null : row;
      },
      async all() {
        return { results: stmt.all(...bound) };
      },
      async run() {
        const info = stmt.run(...bound);
        return { meta: { last_row_id: Number(info.lastInsertRowid), changes: info.changes } };
      },
    };
  }
  return { prepare };
}

function createEnv() {
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);

  const kv = new Map();
  const CONTENT = {
    async put(key, value, opts) {
      kv.set(key, { value, metadata: (opts && opts.metadata) || null });
    },
    async getWithMetadata(key) {
      const entry = kv.get(key);
      return entry ? { value: entry.value, metadata: entry.metadata } : null;
    },
  };

  return { env: { DB: createD1(db), CONTENT }, rawDb: db };
}

async function hashPassword(password, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g).map((b) => parseInt(b, 16)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    {
      name: "PBKDF2",
    },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function seedAdmin(env, email = EMAIL, password = PASS) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = [...saltBytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  const hash = await hashPassword(password, salt);
  await env.DB.prepare("INSERT INTO admins (email, name, salt, password_hash) VALUES (?, ?, ?, ?)")
    .bind(email, "田清標", salt, hash)
    .run();
}

function req(url, opts = {}) {
  return new Request("https://api.test" + url, opts);
}

function jsonReq(url, method, cookie, body) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  return req(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

async function doLogin(env, email = EMAIL, password = PASS) {
  const res = await worker.fetch(
    jsonReq("/api/auth/login", "POST", null, { email, password }),
    env,
    {}
  );
  const setCookie = res.headers.get("set-cookie");
  return { res, cookie: setCookie ? setCookie.split(";")[0] : "" };
}

/* ---------- 認證 ---------- */

test("登入成功回傳 Set-Cookie，session 可用於受保護 API", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { res, cookie } = await doLogin(env);
  assert.equal(res.status, 200);
  assert.ok(cookie.startsWith("tth_session="));

  const me = await worker.fetch(req("/api/auth/me", { headers: { Cookie: cookie } }), env, {});
  assert.equal(me.status, 200);
  const body = await me.json();
  assert.equal(body.email, EMAIL);
});

test("密碼錯誤回 401，連錯 5 次後鎖定 429", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  for (let i = 0; i < 5; i++) {
    const { res } = await doLogin(env, EMAIL, "wrong-pass");
    assert.equal(res.status, 401);
  }
  const locked = await doLogin(env, EMAIL, "wrong-pass");
  assert.equal(locked.res.status, 429);
  const body = await locked.res.json();
  assert.match(body.error, /15 分鐘/);
});

test("未登入存取受保護 API 回 401", async () => {
  const { env } = createEnv();
  const res = await worker.fetch(req("/api/settings"), env, {});
  assert.equal(res.status, 401);
});

test("變更密碼：過短 400 / 現密碼錯 401 / 成功後舊密碼失效", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);

  const short = await worker.fetch(
    jsonReq("/api/auth/change-password", "POST", cookie, { current: PASS, next: "abc" }),
    env,
    {}
  );
  assert.equal(short.status, 400);

  const wrongCurrent = await worker.fetch(
    jsonReq("/api/auth/change-password", "POST", cookie, {
      current: "not-this",
      next: "new-secret-567",
    }),
    env,
    {}
  );
  assert.equal(wrongCurrent.status, 401);

  const ok = await worker.fetch(
    jsonReq("/api/auth/change-password", "POST", cookie, { current: PASS, next: "new-secret-567" }),
    env,
    {}
  );
  assert.equal(ok.status, 200);

  const oldLogin = await doLogin(env, EMAIL, PASS);
  assert.equal(oldLogin.res.status, 401);
  const newLogin = await doLogin(env, EMAIL, "new-secret-567");
  assert.equal(newLogin.res.status, 200);
});

test("logout 後 session 失效", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);
  await worker.fetch(req("/api/auth/logout", { headers: { Cookie: cookie } }), env, {});
  const me = await worker.fetch(req("/api/auth/me", { headers: { Cookie: cookie } }), env, {});
  assert.equal(me.status, 401);
});

/* ---------- 公開資料 ---------- */

test("公開資料 /api/data 回傳七區塊且課程只含 published=1", async () => {
  const { env, rawDb } = createEnv();
  await seedAdmin(env);
  const insert = (sql, ...b) => rawDb.prepare(sql).run(...b);
  insert(
    "INSERT INTO courses (title, tag, published, sort_order) VALUES ('識茶學體驗課','入門',1,0)"
  );
  insert("INSERT INTO courses (title, published, sort_order) VALUES ('草稿課',0,1)");
  insert("INSERT INTO teachers (name) VALUES ('田清標')");
  insert("INSERT INTO exhibitions (year, title) VALUES ('114 年','聯展')");
  insert("INSERT INTO media (type, title) VALUES ('新聞','報導')");
  insert("INSERT INTO services (name) VALUES ('陶藝教學')");
  insert("INSERT INTO works (image, caption) VALUES ('/img/x.jpg','作品')");
  insert("INSERT INTO settings (key, value) VALUES ('phone','0919-123456')");

  const res = await worker.fetch(req("/api/data"), env, {});
  assert.equal(res.status, 200);
  const body = await res.json();
  for (const k of [
    "courses",
    "teachers",
    "exhibitions",
    "media",
    "services",
    "works",
    "settings",
  ]) {
    assert.ok(k in body);
  }
  assert.equal(body.courses.length, 1);
  assert.equal(body.courses[0].published, 1);
  assert.equal(body.settings.phone, "0919-123456");
});

/* ---------- sanitizeBody / CRUD ---------- */

test("sanitizeBody：sort_order 整數化、未知欄位忽略", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);

  const res = await worker.fetch(
    jsonReq("/api/teachers", "POST", cookie, {
      name: "老師A",
      sort_order: "3",
      published: true,
      hack: "x",
      unknown: "y",
    }),
    env,
    {}
  );
  assert.equal(res.status, 200);

  const list = await worker.fetch(req("/api/teachers", { headers: { Cookie: cookie } }), env, {});
  const rows = await list.json();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "老師A");
  assert.equal(rows[0].sort_order, 3);
  assert.ok(!("hack" in rows[0]));
});

test("CRUD 全週期：create → update → delete → 清空", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);

  const create = await worker.fetch(
    jsonReq("/api/media", "POST", cookie, { type: "影音", title: "影片A" }),
    env,
    {}
  );
  const { id } = await create.json();

  const update = await worker.fetch(
    jsonReq(`/api/media/${id}`, "PUT", cookie, { title: "影片A改名" }),
    env,
    {}
  );
  assert.equal(update.status, 200);

  const list1 = await worker.fetch(req("/api/media", { headers: { Cookie: cookie } }), env, {});
  const rows1 = await list1.json();
  assert.equal(rows1.length, 1);
  assert.equal(rows1[0].title, "影片A改名");

  const del = await worker.fetch(
    req(`/api/media/${id}`, { method: "DELETE", headers: { Cookie: cookie } }),
    env,
    {}
  );
  assert.equal(del.status, 200);

  const list2 = await worker.fetch(req("/api/media", { headers: { Cookie: cookie } }), env, {});
  assert.equal((await list2.json()).length, 0);
});

test("settings PUT→GET 回寫", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);

  const put = await worker.fetch(
    jsonReq("/api/settings", "PUT", cookie, { phone: "0919-000", address: "台南" }),
    env,
    {}
  );
  assert.equal(put.status, 200);

  const get = await worker.fetch(req("/api/settings", { headers: { Cookie: cookie } }), env, {});
  const body = await get.json();
  assert.equal(body.phone, "0919-000");
});

/* ---------- 圖片 / KV ---------- */

test("上傳超過 5MB 回 413", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);
  const big = new Uint8Array(5 * 1024 * 1024 + 10);
  const res = await worker.fetch(
    req("/api/upload", {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "image/jpeg", "X-File-Name": "big.jpg" },
      body: big,
    }),
    env,
    {}
  );
  assert.equal(res.status, 413);
});

test("上傳成功存 KV → /img/ 讀回同 bytes；不存在 404", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const { cookie } = await doLogin(env);

  const data = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
  const up = await worker.fetch(
    req("/api/upload", {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "image/jpeg", "X-File-Name": "a.jpg" },
      body: data,
    }),
    env,
    {}
  );
  assert.equal(up.status, 200);
  const { url } = await up.json();
  assert.match(url, /^\/img\/photo:/);

  const img = await worker.fetch(req(url), env, {});
  assert.equal(img.status, 200);
  assert.match(img.headers.get("content-type"), /image\/jpeg/);
  assert.deepEqual(new Uint8Array(await img.arrayBuffer()), data);

  const missing = await worker.fetch(req("/img/photo:nope.jpg"), env, {});
  assert.equal(missing.status, 404);
});

/* ---------- 路由 / CORS ---------- */

test("未知 API 登入後回 404，未登入回 401", async () => {
  const { env } = createEnv();
  await seedAdmin(env);
  const anon = await worker.fetch(req("/api/nothing"), env, {});
  assert.equal(anon.status, 401);

  const { cookie } = await doLogin(env);
  const authed = await worker.fetch(req("/api/nothing", { headers: { Cookie: cookie } }), env, {});
  assert.equal(authed.status, 404);
});

test("CORS：允許來源回相對標頭", async () => {
  const { env } = createEnv();
  const res = await worker.fetch(
    req("/api/data", {
      headers: { Origin: "https://rock903400-byte.github.io" },
    }),
    env,
    {}
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "https://rock903400-byte.github.io");
});
