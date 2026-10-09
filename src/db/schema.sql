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