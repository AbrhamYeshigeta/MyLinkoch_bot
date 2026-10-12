// src/db/index.js
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

function ensureSchema() {
  db.exec(schema);

  const existingTables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
  );

  if (!existingTables.has("users")) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id      INTEGER PRIMARY KEY,
        username     TEXT,
        first_name   TEXT,
        last_name    TEXT,
        language     TEXT,
        is_premium   INTEGER DEFAULT 0,
        first_seen   INTEGER DEFAULT (unixepoch()),
        last_seen    INTEGER DEFAULT (unixepoch()),
        start_count  INTEGER DEFAULT 0,
        message_count INTEGER DEFAULT 0,
        links_saved  INTEGER DEFAULT 0,
        blocked      INTEGER DEFAULT 0
      );
    `);
  }

  const userColumns = new Set(
    db.prepare("PRAGMA table_info(users)").all().map((row) => row.name)
  );

  const requiredColumns = {
    user_id: "INTEGER PRIMARY KEY",
    username: "TEXT",
    first_name: "TEXT",
    last_name: "TEXT",
    language: "TEXT",
    is_premium: "INTEGER DEFAULT 0",
    first_seen: "INTEGER DEFAULT (unixepoch())",
    last_seen: "INTEGER DEFAULT (unixepoch())",
    start_count: "INTEGER DEFAULT 0",
    message_count: "INTEGER DEFAULT 0",
    links_saved: "INTEGER DEFAULT 0",
    blocked: "INTEGER DEFAULT 0",
  };

  for (const [columnName, definition] of Object.entries(requiredColumns)) {
    if (!userColumns.has(columnName)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${definition}`);
    }
  }
}

ensureSchema();