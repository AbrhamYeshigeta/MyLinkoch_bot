import { InlineKeyboard } from "grammy";
import { config } from "../config.js";

export function mainMenuKeyboard(userId = null) {
  const kb = new InlineKeyboard()
    .text("📚 My Links", "my_links")
    .text("🔍 Search", "search_links")
    .row()
    .text("⏰ Reminders", "manage_reminders")
    .text("➕ Save Link", "save_link");

  const adminId = Number(config.adminId || 0);
  const currentUserId = Number(userId ?? 0);

  if (adminId > 0 && currentUserId > 0 && currentUserId === adminId) {
    kb.row().text("👑 Admin Dashboard", "admin:stats");
  }

  return kb;
}
