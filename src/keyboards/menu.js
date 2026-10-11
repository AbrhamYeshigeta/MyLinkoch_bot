import { InlineKeyboard } from "grammy";

export function mainMenuKeyboard() {
  return new InlineKeyboard()
    .text("📚 My Links", "my_links")
    .text("🔍 Search", "search_links")
    .row()
    .text("⏰ Reminders", "manage_reminders")
    .text("➕ Save Link", "save_link");
}
