import {
  getLink, updateNote, updateCategory, toggleFavorite,
  addReminder, getAllCategories,
} from "../db/queries.js";
import {
  categoryKeyboard, reminderKeyboard, linkActionsKeyboard,
} from "../keyboards/linkActions.js";
import { setPending, clearPending } from "../utils/state.js";
import { linkCard } from "../utils/format.js";

export function registerCallbacks(bot) {
  bot.callbackQuery(/^note:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    setPending(ctx.from.id, "note", { id });
    await ctx.answerCallbackQuery();
    await ctx.reply("📝 Send me the note you want to attach to this link.");
  });

  // open picker
  bot.callbackQuery(/^cat:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const cats = getAllCategories(ctx.from.id);
    await ctx.answerCallbackQuery();
    await ctx.reply("🏷 Choose a category:", {
      reply_markup: categoryKeyboard(id, cats),
    });
  });

  // user tapped a category — index into getAllCategories at THIS moment
  bot.callbackQuery(/^setcat:(\d+):(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const idx = +ctx.match[2];
    const cats = getAllCategories(ctx.from.id);
    const cat = cats[idx];

    if (!cat) {
      return ctx.answerCallbackQuery({
        text: "Category list changed — try again",
        show_alert: true,
      });
    }

    updateCategory(id, ctx.from.id, cat);
    const link = getLink(id, ctx.from.id);
    await ctx.answerCallbackQuery({ text: `Set to ${cat}` });
    await ctx.editMessageText(linkCard(link), {
      parse_mode: "HTML",
      reply_markup: linkActionsKeyboard(id, link.url),
      disable_web_page_preview: true,
    });
  });

  // ➕ New category button from the picker
  bot.callbackQuery(/^newcat:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    setPending(ctx.from.id, "newcategory", { id });
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "✏️ Send a name for the new category.\n" +
      "Tip: start with an emoji, like <code>🍕 Food</code>",
      { parse_mode: "HTML" }
    );
  });

  bot.callbackQuery(/^fav:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const link = toggleFavorite(id, ctx.from.id);
    if (!link) return ctx.answerCallbackQuery({ text: "Not found" });
    await ctx.answerCallbackQuery({ text: link.favorite ? "⭐ Added" : "Removed" });
    await ctx.editMessageText(linkCard(link), {
      parse_mode: "HTML",
      reply_markup: linkActionsKeyboard(id, link.url),
      disable_web_page_preview: true,
    });
  });

  bot.callbackQuery(/^rem:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    await ctx.answerCallbackQuery();
    await ctx.reply("⏰ When should I remind you?", {
      reply_markup: reminderKeyboard(id),
    });
  });

  bot.callbackQuery(/^setrem:(\d+):(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const minutes = +ctx.match[2];
    const when = Math.floor(Date.now() / 1000) + minutes * 60;
    addReminder(id, ctx.from.id, when);
    await ctx.answerCallbackQuery({ text: "✅ Reminder set" });
    await ctx.editMessageText(
      `⏰ Reminder set for <b>${new Date(when * 1000).toLocaleString()}</b>`,
      { parse_mode: "HTML" }
    );
  });

  bot.callbackQuery(/^customrem:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    setPending(ctx.from.id, "customremind", { id });
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "✏️ Send a time like:\n" +
      "• <code>30m</code> — 30 minutes\n" +
      "• <code>2h</code> — 2 hours\n" +
      "• <code>3d</code> — 3 days\n" +
      "• <code>2026-10-10 09:00</code> — exact date",
      { parse_mode: "HTML" }
    );
  });

  bot.callbackQuery(/^cancelrem:(\d+)$/, async (ctx) => {
    clearPending(ctx.from.id);
    await ctx.answerCallbackQuery({ text: "Cancelled" });
    await ctx.deleteMessage().catch(() => {});
  });
}