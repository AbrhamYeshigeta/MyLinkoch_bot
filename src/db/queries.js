import { db } from "./index.js";
import { config } from "../config.js";

/* ---------- LINKS ---------- */

export function insertLink(link) {
  const info = db.prepare(`
    INSERT INTO links (user_id, url, title, description, domain, category, tags, note)
    VALUES (@user_id, @url, @title, @description, @domain, @category, @tags, @note)
  `).run(link);
  return info.lastInsertRowid;
}

export function getLink(id, userId) {
  return db.prepare(`SELECT * FROM links WHERE id = ? AND user_id = ?`).get(id, userId);
}

export function updateNote(id, userId, note) {
  db.prepare(`UPDATE links SET note = ? WHERE id = ? AND user_id = ?`).run(note, id, userId);
}

export function updateCategory(id, userId, category) {
  db.prepare(`UPDATE links SET category = ? WHERE id = ? AND user_id = ?`).run(category, id, userId);
}

export function toggleFavorite(id, userId) {
  db.prepare(`UPDATE links SET favorite = 1 - favorite WHERE id = ? AND user_id = ?`).run(id, userId);
  return getLink(id, userId);
}

export function deleteLink(id, userId) {
  db.prepare(`DELETE FROM reminders WHERE link_id = ? AND user_id = ?`).run(id, userId);
  return db.prepare(`DELETE FROM links WHERE id = ? AND user_id = ?`).run(id, userId).changes;
}

export function listByCategory(userId) {
  return db.prepare(`
    SELECT category, COUNT(*) AS count
    FROM links WHERE user_id = ?
    GROUP BY category ORDER BY count DESC
  `).all(userId);
}

export function listFavorites(userId) {
  return db.prepare(`
    SELECT * FROM links WHERE user_id = ? AND favorite = 1
    ORDER BY created_at DESC LIMIT 20
  `).all(userId);
}

export function searchLinks(userId, keyword) {
  const q = `%${keyword.toLowerCase()}%`;
  return db.prepare(`
    SELECT * FROM links
    WHERE user_id = ?
      AND (
        LOWER(title) LIKE ? OR LOWER(note) LIKE ?
        OR LOWER(url) LIKE ? OR LOWER(tags) LIKE ?
        OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?
      )
    ORDER BY created_at DESC LIMIT 20
  `).all(userId, q, q, q, q, q, q);
}

/* ---------- REMINDERS ---------- */

export function addReminder(linkId, userId, remindAt) {
  db.prepare(`INSERT INTO reminders (link_id, user_id, remind_at) VALUES (?, ?, ?)`)
    .run(linkId, userId, remindAt);
}

export function dueReminders(nowUnix) {
  return db.prepare(`
    SELECT r.id AS rid, r.user_id, l.id AS link_id, l.url, l.title, l.note
    FROM reminders r
    JOIN links l ON l.id = r.link_id
    WHERE r.sent = 0 AND r.remind_at <= ?
  `).all(nowUnix);
}

export function listUpcomingReminders(userId, limit = 20) {
  return db.prepare(`
    SELECT r.id AS reminder_id, l.id AS link_id, l.title, l.url, r.remind_at
    FROM reminders r
    JOIN links l ON l.id = r.link_id
    WHERE r.user_id = ? AND r.sent = 0
    ORDER BY r.remind_at ASC
    LIMIT ?
  `).all(userId, limit);
}

export function markReminderSent(rid) {
  db.prepare(`UPDATE reminders SET sent = 1 WHERE id = ?`).run(rid);
}

/* ---------- CATEGORIES ---------- */

export function getUserCategories(userId) {
  return db.prepare(`
    SELECT name FROM user_categories WHERE user_id = ? ORDER BY created_at ASC
  `).all(userId).map((r) => r.name);
}

export function getAllCategories(userId) {
  return [...config.defaultCategories, ...getUserCategories(userId)];
}

export function addUserCategory(userId, name) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  if (trimmed.length > config.maxCategoryNameLength) return { ok: false, reason: "too_long" };
  if (config.defaultCategories.includes(trimmed)) return { ok: false, reason: "is_default" };

  const existing = getUserCategories(userId);
  if (existing.includes(trimmed)) return { ok: false, reason: "exists" };
  if (existing.length >= config.maxCategoriesPerUser) return { ok: false, reason: "limit" };

  db.prepare(`INSERT INTO user_categories (user_id, name) VALUES (?, ?)`).run(userId, trimmed);
  return { ok: true, name: trimmed };
}

export function removeUserCategory(userId, name) {
  const info = db.prepare(`
    DELETE FROM user_categories WHERE user_id = ? AND name = ?
  `).run(userId, name.trim());
  return info.changes > 0;
}

// src/db/queries.js
export function listLinksForUser(userId) {
  return db.prepare(`
    SELECT * FROM links WHERE user_id = ? 
    ORDER BY category ASC, created_at DESC
  `).all(userId);
}