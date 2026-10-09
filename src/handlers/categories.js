import {
  getAllCategories, getUserCategories,
  addUserCategory, removeUserCategory,
} from "../db/queries.js";
import { config } from "../config.js";
import { escapeHtml } from "../utils/format.js";

export function registerCategories(bot) {
  // /categories — show defaults + custom
  bot.command("categories", (ctx) => {
    const defaults = config.defaultCategories;
    const custom = getUserCategories(ctx.from.id);

    let text = `🏷 <b>YOUR CATEGORIES</b>\n\n`;
    text += `<b>Default (${defaults.length}):</b>\n`;
    text += defaults.map((c) => `• ${escapeHtml(c)}`).join("\n");

    text += `\n\n<b>Your custom (${custom.length}):</b>\n`;
    text += custom.length
      ? custom.map((c) => `• ${escapeHtml(c)}`).join("\n")
      : "<i>None yet. Add one with</i>\n<code>/addcategory 🍕 Food</code>";

    text += `\n\n<i>Add: /addcategory &lt;name&gt;\nRemove: /removecategory &lt;name&gt;</i>`;

    ctx.reply(text, { parse_mode: "HTML" });
  });

  // /addcategory <name>
  bot.command("addcategory", (ctx) => {
    const raw = ctx.match?.trim();
    if (!raw) {
      return ctx.reply(
        "Usage: <code>/addcategory 🍕 Food</code>\n" +
        "You can include an emoji at the start.",
        { parse_mode: "HTML" }
      );
    }

    const result = addUserCategory(ctx.from.id, raw);
    if (!result.ok) {
      const reasons = {
        empty: "Name is empty.",
        too_long: `Max ${config.maxCategoryNameLength} characters.`,
        is_default: "That's already a default category.",
        exists: "You already have that category.",
        limit: `You've reached the limit of ${config.maxCategoriesPerUser} custom categories.`,
      };
      return ctx.reply("⚠️ " + (reasons[result.reason] ?? "Could not add."));
    }

    ctx.reply(`✅ Added: <b>${escapeHtml(result.name)}</b>`, { parse_mode: "HTML" });
  });

  // /removecategory <name>
  bot.command("removecategory", (ctx) => {
    const raw = ctx.match?.trim();
    if (!raw) return ctx.reply("Usage: /removecategory 🍕 Food");

    if (config.defaultCategories.includes(raw)) {
      return ctx.reply("That's a default category and can't be removed.");
    }

    const removed = removeUserCategory(ctx.from.id, raw);
    ctx.reply(
      removed
        ? `🗑 Removed: <b>${escapeHtml(raw)}</b>`
        : `Not found in your custom categories.`,
      { parse_mode: "HTML" }
    );
  });
}