/* ============================================================
   陶茶雅舍後台 — Cloudflare Worker API
   認證模式沿用果醬女孩：PBKDF2 + HttpOnly Cookie + 登入次數限制
   ============================================================ */

const COOKIE_NAME = "tth_session";
const SESSION_DAYS = 7;
const RATE_MAX = 5;
const RATE_WINDOW = 900;

const ALLOWED_ORIGINS = [
  "https://rock903400-byte.github.io",
  "http://localhost:8787",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

/* ---------------- 資源定義 ---------------- */

const RESOURCES = {
  courses: {
    fields: ["title", "tag", "subtitle", "description", "date", "time", "fee", "capacity", "bonus", "location", "signup_url", "image", "published", "sort_order"],
  },
  teachers: {
    fields: ["name", "title", "bio", "image", "sort_order"],
  },
  exhibitions: {
    fields: ["year", "title", "sort_order"],
  },
  media: {
    fields: ["type", "title", "description", "link", "sort_order"],
  },
  services: {
    fields: ["icon", "name", "description", "sort_order"],
  },
  works: {
    fields: ["image", "caption", "sort_order"],
  },
};

/* ---------------- 基礎工具 ---------------- */

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-File-Name",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function cleanValue(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function cleanBoolean(v) {
  return v ? 1 : 0;
}

/* ---------------- 認證工具 ---------------- */

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const parts = header.split(";").map((s) => s.trim());
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx > -1 && part.slice(0, idx) === name) {
      return decodeURIComponent(part.slice(idx + 1));
    }
  }
  return null;
}

export async function verifySession(env, request) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT s.id AS session_id, s.expires_at, a.id AS admin_id, a.email, a.name
     FROM sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`,
  )
    .bind(token)
    .first();
  return row || null;
}

function setSessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${SESSION_DAYS * 86400}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`;
}

async function hashPassword(password, saltHex) {
  const salt = Uint8Array.from(
    saltHex.match(/.{2}/g).map((b) => parseInt(b, 16)),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    key,
    256,
  );
  return [...new Uint8Array(bits)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function newSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createSession(env, adminId) {
  const token = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO sessions (token, admin_id, expires_at)
     VALUES (?, ?, datetime('now', '+' || ? || ' days'))`,
  )
    .bind(token, adminId, SESSION_DAYS)
    .run();
  return token;
}

async function deleteSession(env, request) {
  const token = getCookie(request, COOKIE_NAME);
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?")
      .bind(token)
      .run();
  }
}

function clientKey(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "unknown"
  );
}

async function getFailCount(env, key) {
  const row = await env.DB.prepare(
    "SELECT count, updated_at FROM login_attempts WHERE key = ?",
  )
    .bind(key)
    .first();
  if (!row) return 0;
  const now = Math.floor(Date.now() / 1000);
  if (now - row.updated_at > RATE_WINDOW) return 0;
  return row.count;
}

async function recordFailure(env, key) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO login_attempts (key, count, updated_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN ? - updated_at > ? THEN 1 ELSE count + 1 END,
       updated_at = ?`,
  )
    .bind(key, now, now, RATE_WINDOW, now)
    .run();
}

async function clearFailures(env, key) {
  await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(key).run();
}

/* ---------------- 認證 API ---------------- */

async function handleLogin(request, env) {
  const key = clientKey(request);
  const fails = await getFailCount(env, key);
  if (fails >= RATE_MAX) {
    return json({ ok: false, error: "嘗試次數過多，請 15 分鐘後再試" }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "無法解析請求內容" }, 400);
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return json({ ok: false, error: "請輸入帳號與密碼" }, 400);
  }

  const admin = await env.DB.prepare("SELECT * FROM admins WHERE email = ?")
    .bind(email)
    .first();
  if (!admin) {
    await recordFailure(env, key);
    return json({ ok: false, error: "帳號或密碼錯誤" }, 401);
  }

  const hash = await hashPassword(password, admin.salt);
  if (hash !== admin.password_hash) {
    await recordFailure(env, key);
    return json({ ok: false, error: "帳號或密碼錯誤" }, 401);
  }

  await clearFailures(env, key);
  const token = await createSession(env, admin.id);
  return json(
    { ok: true, name: admin.name, email: admin.email },
    200,
    { "Set-Cookie": setSessionCookie(token) },
  );
}

async function handleLogout(request, env) {
  await deleteSession(env, request);
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}

async function handleMe(request, env) {
  const admin = await verifySession(env, request);
  if (!admin) return json({ ok: false, error: "請先登入" }, 401);
  return json({ ok: true, name: admin.name, email: admin.email });
}

/* ---------------- 公開資料 ---------------- */

async function handlePublicData(env) {
  const [courses, teachers, exhibitions, media, services, works, settingsRows] =
    await Promise.all([
      env.DB.prepare("SELECT * FROM courses WHERE published = 1 ORDER BY sort_order ASC, id DESC").all(),
      env.DB.prepare("SELECT * FROM teachers ORDER BY sort_order ASC, id ASC").all(),
      env.DB.prepare("SELECT * FROM exhibitions ORDER BY sort_order ASC, id ASC").all(),
      env.DB.prepare("SELECT * FROM media ORDER BY sort_order ASC, id ASC").all(),
      env.DB.prepare("SELECT * FROM services ORDER BY sort_order ASC, id ASC").all(),
      env.DB.prepare("SELECT * FROM works ORDER BY sort_order ASC, id ASC").all(),
      env.DB.prepare("SELECT key, value FROM settings").all(),
    ]);

  const settings = {};
  for (const row of settingsRows.results) settings[row.key] = row.value;

  return json({
    courses: courses.results,
    teachers: teachers.results,
    exhibitions: exhibitions.results,
    media: media.results,
    services: services.results,
    works: works.results,
    settings,
  });
}

/* ---------------- CRUD API ---------------- */

function sanitizeBody(body, resource) {
  const def = RESOURCES[resource];
  const out = {};
  for (const field of def.fields) {
    if (body[field] === undefined) continue;
    if (field === "published" || field === "sort_order") {
      out[field] = cleanBoolean(body[field]) || parseInt(body[field], 10) || 0;
    } else {
      out[field] = cleanValue(body[field]);
    }
  }
  return out;
}

async function handleList(resource, env) {
  const rows = await env.DB.prepare(
    `SELECT * FROM ${resource} ORDER BY sort_order ASC, id ASC`,
  ).all();
  return json(rows.results);
}

async function handleCreate(resource, request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "無法解析請求內容" }, 400);
  }
  const data = sanitizeBody(body, resource);
  const def = RESOURCES[resource];
  const cols = def.fields.filter((f) => data[f] !== undefined);
  if (cols.length === 0) return json({ ok: false, error: "沒有可儲存的資料" }, 400);
  const placeholders = cols.map(() => "?").join(", ");
  const values = cols.map((c) => data[c]);
  const result = await env.DB.prepare(
    `INSERT INTO ${resource} (${cols.join(", ")}) VALUES (${placeholders})`,
  )
    .bind(...values)
    .run();
  return json({ ok: true, id: result.meta.last_row_id });
}

async function handleUpdate(resource, id, request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "無法解析請求內容" }, 400);
  }
  const data = sanitizeBody(body, resource);
  const def = RESOURCES[resource];
  const cols = def.fields.filter((f) => data[f] !== undefined);
  if (cols.length === 0) return json({ ok: false, error: "沒有可更新的資料" }, 400);
  const sets = cols.map((c) => `${c} = ?`).join(", ");
  const values = cols.map((c) => data[c]);
  await env.DB.prepare(`UPDATE ${resource} SET ${sets} WHERE id = ?`)
    .bind(...values, id)
    .run();
  return json({ ok: true });
}

async function handleDelete(resource, id, env) {
  await env.DB.prepare(`DELETE FROM ${resource} WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

async function handleSettingsGet(env) {
  const rows = await env.DB.prepare("SELECT key, value FROM settings").all();
  const settings = {};
  for (const row of rows.results) settings[row.key] = row.value;
  return json(settings);
}

async function handleSettingsUpdate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "無法解析請求內容" }, 400);
  }
  for (const [key, value] of Object.entries(body)) {
    await env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
      .bind(key, cleanValue(value))
      .run();
  }
  return json({ ok: true });
}

/* ---------------- 圖片上傳（Workers KV）---------------- */

function arrayBufferToBase64(buf) {
  let s = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

async function handleUpload(request, env) {
  const contentType = request.headers.get("Content-Type") || "application/octet-stream";
  const fileName = request.headers.get("X-File-Name") || "";
  const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
  const allowedExt = ["jpg", "jpeg", "png", "webp", "gif"];
  const safeExt = allowedExt.includes(ext) ? ext : "jpg";

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > 5 * 1024 * 1024) {
    return json({ ok: false, error: "圖片不可超過 5MB" }, 413);
  }

  const key = `photo:${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  await env.CONTENT.put(key, arrayBufferToBase64(bytes), {
    metadata: { type: contentType },
  });

  return json({ ok: true, url: `/img/${key}` });
}

async function handleImage(request, env, pathname) {
  const key = decodeURIComponent(pathname.slice("/img/".length)).slice(0, 256);
  const got = await env.CONTENT.getWithMetadata(key);
  if (!got || got.value == null) {
    return json({ ok: false, error: "圖片不存在" }, 404);
  }
  const bin = Uint8Array.from(atob(got.value), (c) => c.charCodeAt(0));
  return new Response(bin, {
    headers: {
      "Content-Type": (got.metadata && got.metadata.type) || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

/* ---------------- 路由 ---------------- */

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = request.headers.get("Origin");
  const allowed = origin && ALLOWED_ORIGINS.includes(origin);
  const cors = corsHeaders(allowed ? origin : "");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const withCors = (res) => {
    const r = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
    return r;
  };

  /* 圖片（公開） */
  if (request.method === "GET" && pathname.startsWith("/img/")) {
    return withCors(await handleImage(request, env, pathname));
  }

  /* 登入（公開） */
  if (pathname === "/api/auth/login" && request.method === "POST") {
    return withCors(await handleLogin(request, env));
  }

  /* 其餘 API */
  if (pathname.startsWith("/api/")) {
    /* 公開資料 */
    if (pathname === "/api/data" && request.method === "GET") {
      return withCors(await handlePublicData(env));
    }

    /* 登出 / 目前身份（需要登入才能登出） */
    if (pathname === "/api/auth/logout") {
      return withCors(await handleLogout(request, env));
    }
    if (pathname === "/api/auth/me") {
      return withCors(await handleMe(request, env));
    }

    /* 以下全部需要登入 */
    const admin = await verifySession(env, request);
    if (!admin) return withCors(json({ ok: false, error: "請先登入" }, 401));

    /* 聯絡資訊 settings */
    if (pathname === "/api/settings" && request.method === "GET") {
      return withCors(await handleSettingsGet(env));
    }
    if (pathname === "/api/settings" && request.method === "PUT") {
      return withCors(await handleSettingsUpdate(request, env));
    }

    /* 圖片上傳 */
    if (pathname === "/api/upload" && request.method === "POST") {
      return withCors(await handleUpload(request, env));
    }

    /* 資源 CRUD */
    const match = pathname.match(/^\/api\/(courses|teachers|exhibitions|media|services|works)(?:\/(\d+))?$/);
    if (match) {
      const resource = match[1];
      const id = match[2];
      if (request.method === "GET" && !id) {
        return withCors(await handleList(resource, env));
      }
      if (request.method === "POST" && !id) {
        return withCors(await handleCreate(resource, request, env));
      }
      if (request.method === "PUT" && id) {
        return withCors(await handleUpdate(resource, id, request, env));
      }
      if (request.method === "DELETE" && id) {
        return withCors(await handleDelete(resource, id, env));
      }
    }

    return withCors(json({ ok: false, error: "找不到此 API" }, 404));
  }

  return json({ ok: false, error: "找不到頁面" }, 404);
}

export default {
  fetch: handleRequest,
};
