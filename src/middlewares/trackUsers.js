import { db } from "../db/index.js";
import { logger } from "../utils/logger.js";

export function trackUsers() {
  // Prepared statements (fast, runs every message)
  const upsert = db.prepare(`
    INSERT INTO users (
      user_id, username, first_name, last_name, language,
      is_premium, start_count, message_count
    )
    VALUES (
      @id, @username, @first_name, @last_name, @language,
      @is_premium, @is_start, 1
    )
    ON CONFLICT(user_id) DO UPDATE SET
      username      = excluded.username,
      first_name    = excluded.first_name,
      last_name     = excluded.last_name,
      language      = excluded.language,
      is_premium    = excluded.is_premium,
      last_seen     = unixepoch(),
      start_count   = start_count + @is_start,
      message_count = message_count + 1
  `);

  const bumpLinks = db.prepare(`
    UPDATE users SET links_saved = links_saved + 1 WHERE user_id = ?
  `);

  return async (ctx, next) => {
    try {
      if (ctx.from && !ctx.from.is_bot) {
        const isStart =
          ctx.message?.text?.startsWith("/start") ||
          ctx.callbackQuery?.data === "subcheck" ? 1 : 0;

        upsert.run({
          id: ctx.from.id,
          username: ctx.from.username ?? null,
          first_name: ctx.from.first_name ?? null,
          last_name: ctx.from.last_name ?? null,
          language: ctx.from.language_code ?? null,
          is_premium: ctx.from.is_premium ? 1 : 0,
          is_start: isStart,
        });
      }
    } catch (e) {
      logger.error("trackUsers failed:", e.message);
    }
    await next();
  };
}

// Call this from your save handler to count links per user
export function incrementUserLinks(userId) {
  try {
    db.prepare(`UPDATE users SET links_saved = links_saved + 1 WHERE user_id = ?`)
      .run(userId);
  } catch {}
}