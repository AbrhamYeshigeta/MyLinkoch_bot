CREATE TABLE IF NOT EXISTS links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  domain      TEXT,
  category    TEXT DEFAULT '📁 Unsorted',
  tags        TEXT DEFAULT '',
  note        TEXT DEFAULT '',
  favorite    INTEGER DEFAULT 0,
  created_at  INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS reminders (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id   INTEGER NOT NULL,
  user_id   INTEGER NOT NULL,
  remind_at INTEGER NOT NULL,
  sent      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  name       TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_rem_due ON reminders(sent, remind_at);
CREATE INDEX IF NOT EXISTS idx_ucat_user ON user_categories(user_id);

-- ─────────────────────────────────────────────────────
--  USERS — tracks everyone who ever touched the bot
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id      INTEGER PRIMARY KEY,        -- Telegram user ID (unique)
  username     TEXT,                       -- @username (nullable)
  first_name   TEXT,                       -- display name
  last_name    TEXT,
  language     TEXT,                       -- e.g. "en", "am"
  is_premium   INTEGER DEFAULT 0,          -- Telegram Premium flag
  first_seen   INTEGER DEFAULT (unixepoch()),
  last_seen    INTEGER DEFAULT (unixepoch()),
  start_count  INTEGER DEFAULT 0,          -- how many times they hit /start
  message_count INTEGER DEFAULT 0,         -- total messages sent
  links_saved  INTEGER DEFAULT 0,          -- total links saved
  blocked      INTEGER DEFAULT 0           -- set to 1 if they block the bot
);

CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_first_seen ON users(first_seen);