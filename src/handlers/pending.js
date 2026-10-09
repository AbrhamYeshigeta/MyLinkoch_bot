import { getPending, clearPending } from "../utils/state.js";
import {
  updateNote, getLink, addReminder,
  addUserCategory, updateCategory, getAllCategories,
} from "../db/queries.js";
import { linkCard } from "../utils/format.js";
import { linkActionsKeyboard, categoryKeyboard } from "../keyboards/linkActions.js";
import { config } from "../config.js";
import { escapeHtml } from "../utils/format.js";

function parseWhen(input) {
  const s = input.trim().toLowerCase();
  const m = s.match(/^(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)$/);
  if (m) {
    const n = +m[1];
    const unit = m[2][0];
    const mult = unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
    return Math.floor(Date.now() / 1000) + n * mult;
  }
  const dt = new Date(input);
  if (!isNaN(dt.getTime())) return Math.floor(dt.getTime() / 1000);
  return null;
}

export function registerPending(bot) {
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message.text.trim();
    const p = getPending(ctx.from.id);
    if (!p) return next();

    /* -------- Note -------- */
    if (p.action === "note") {
      const id = p.data.id;
      updateNote(id, ctx.from.id, text);
      clearPending(ctx.from.id);
      const link = getLink(id, ctx.from.id);
      return ctx.reply(linkCard(link), {
        parse_mode: "HTML",
        reply_markup: linkActionsKeyboard(id, link.url),
        disable_web_page_preview: true,
      });
    }

    /* -------- Custom reminder -------- */
    if (p.action === "customremind") {
      const when = parseWhen(text);
      if (!when || when < Math.floor(Date.now() / 1000)) {
        return ctx.reply("⚠️ I couldn't understand that time. Try `30m`, `2h`, `3d`, or a date.");
      }
      addReminder(p.data.id, ctx.from.id, when);
      clearPending(ctx.from.id);
      return ctx.reply(
        `⏰ Reminder set for <b>${new Date(when * 1000).toLocaleString()}</b>`,
        { parse_mode: "HTML" }
      );
    }

    /* -------- New custom category -------- */
    if (p.action === "newcategory") {
      const result = addUserCategory(ctx.from.id, text);
      if (!result.ok) {
        const reasons = {
          empty: "Name is empty. Try again.",
          too_long: `Max ${config.maxCategoryNameLength} characters.`,
          is_default: "That's already a default category.",
          exists: "You already have that category.",
          limit: `You've hit the limit (${config.maxCategoriesPerUser}).`,
        };
        return ctx.reply("⚠️ " + (reasons[result.reason] ?? "Could not add."));
      }

      // auto-apply the new category to the link the user was editing
      const linkId = p.data.id;
      updateCategory(linkId, ctx.from.id, result.name);
      clearPending(ctx.from.id);

      const link = getLink(linkId, ctx.from.id);
      await ctx.reply(
        `✅ Added <b>${escapeHtml(result.name)}</b> and applied it to link #${linkId}.`,
        { parse_mode: "HTML" }
      );
      return ctx.reply(linkCard(link), {
        parse_mode: "HTML",
        reply_markup: linkActionsKeyboard(linkId, link.url),
        disable_web_page_preview: true,
      });
    }

    return next();
  });
}