-- 陶茶雅舍後台資料庫結構
PRAGMA foreign_keys = ON;

-- 管理員
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '管理員',
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 登入會話
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  admin_id INTEGER NOT NULL REFERENCES admins(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- 登入失敗紀錄（防暴力破解）
CREATE TABLE IF NOT EXISTS login_attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

-- 課程資訊
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tag TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  fee TEXT DEFAULT '',
  capacity TEXT DEFAULT '',
  bonus TEXT DEFAULT '',
  location TEXT DEFAULT '',
  signup_url TEXT DEFAULT '',
  image TEXT DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 師資介紹
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  image TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 參展經歷
CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 媒體報導
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT DEFAULT '新聞專訪',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  link TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 服務項目
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon TEXT DEFAULT '',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 作品展示
CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 聯絡資訊（key-value）
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_exhibitions_sort ON exhibitions(sort_order);
CREATE INDEX IF NOT EXISTS idx_works_sort ON works(sort_order);
