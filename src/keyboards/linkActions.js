import { InlineKeyboard } from "grammy";

export function linkActionsKeyboard(id, url) {
  return new InlineKeyboard()
    .text("📝 Note", `note:${id}`)
    .text("🏷 Category", `cat:${id}`)
    .text("⭐ Fav", `fav:${id}`)
    .row()
    .text("⏰ Remind", `rem:${id}`)
    .url("🔗 Open", url);
}

// Uses index into getAllCategories(userId) — stable enough for one tap
export function categoryKeyboard(id, categories) {
  const kb = new InlineKeyboard();
  categories.forEach((c, i) => {
    kb.text(c, `setcat:${id}:${i}`);
    if ((i + 1) % 2 === 0) kb.row();
  });
  // pad odd count
  if (categories.length % 2 !== 0) kb.row();
  kb.text("➕ New category", "newcat:" + id);
  return kb;
}

export function reminderKeyboard(id) {
  return new InlineKeyboard()
    .text("⏰ 1 hour",   `setrem:${id}:60`)
    .text("🌅 Tomorrow",  `setrem:${id}:1440`)
    .row()
    .text("📅 3 days",   `setrem:${id}:4320`)
    .text("🗓 1 week",    `setrem:${id}:10080`)
    .row()
    .text("✏️ Custom",  `customrem:${id}`)
    .text("❌ Cancel",   `cancelrem:${id}`);
}

export function categoryManageKeyboard(customNames) {
  const kb = new InlineKeyboard();
  customNames.forEach((name, i) => {
    kb.text(`🗑 ${name}`, `delcat:${i}`);
    kb.row();
  });
  return kb;
}