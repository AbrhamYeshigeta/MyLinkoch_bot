// src/handlers/callbacks.js
import {
  getLink, updateNote, updateCategory, toggleFavorite,
  addReminder, getAllCategories, listLinksForUser,
  listUpcomingReminders,
} from "../db/queries.js";
import {
  categoryKeyboard, reminderKeyboard, linkActionsKeyboard,
} from "../keyboards/linkActions.js";
import { setPending, clearPending } from "../utils/state.js";
import { linkCard, escapeHtml } from "../utils/format.js";
import { markUserVerified } from "../middlewares/subscription.js";

export function registerCallbacks(bot) {
  // --- MAIN MENU BUTTONS ---
  bot.callbackQuery("my_links", async (ctx) => {
    await ctx.answerCallbackQuery();
    const links = listLinksForUser(ctx.from.id);
    if (!links.length) return ctx.reply("You have no links yet. Send me one! 📎");

    const grouped = links.reduce((acc, link) => {
      if (!acc[link.category]) acc[link.category] = [];
      acc[link.category].push(link);
      return acc;
    }, {});

    let text = `📚 <b>MY SAVED LINKS (${links.length})</b>\n\n`;
    for (const [cat, items] of Object.entries(grouped)) {
      text += `<b>${cat}</b>\n`;
      items.forEach(item => {
        text += `  #${item.id} — <a href="${item.url}">${escapeHtml(item.title)}</a>\n`;
      });
      text += `\n`;
    }
    await ctx.reply(text, { parse_mode: "HTML", disable_web_page_preview: true });
  });

  bot.callbackQuery("search_links", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "Search mode is ready" });
    setPending(ctx.from.id, "search", {});
    await ctx.reply(
      "🔎 <b>Search mode is ready</b>\n\nSend any keyword, category name, note, URL, or website name to search your saved links.",
      { parse_mode: "HTML" }
    );
  });

  bot.callbackQuery("manage_reminders", async (ctx) => {
    await ctx.answerCallbackQuery();
    const rows = listUpcomingReminders(ctx.from.id, 20);
    if (!rows.length) {
      return ctx.reply("⏰ <b>Reminders</b>\n\nYou do not have any active reminders yet. Open a saved link and tap the reminder option to schedule one.", { parse_mode: "HTML" });
    }
    const text = rows.map((row, index) =>
      `${index + 1}. <b>${row.title || "Saved link"}</b>\n   ⏰ ${new Date(row.remind_at * 1000).toLocaleString()}\n   ${row.url}`
    ).join("\n\n");
    await ctx.reply(`⏰ <b>UPCOMING REMINDERS</b>\n\n${text}`, { parse_mode: "HTML", disable_web_page_preview: true });
  });

  bot.callbackQuery("save_link", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("📎 Send me a URL and I’ll save it with title, category, and tags automatically.");
  });

  // --- SUBSCRIPTION CHECK ---
  bot.callbackQuery("check_sub", async (ctx) => {
    const { config } = await import("../config.js");
    const requiredChannels = Array.isArray(config.requiredChannels) ? config.requiredChannels : [];
    let allSubscribed = true;

    for (const channel of requiredChannels) {
      try {
        const member = await ctx.api.getChatMember(channel, ctx.from.id);
        if (["left", "kicked"].includes(member.status)) {
          allSubscribed = false;
          break;
        }
      } catch (e) {
        console.error(`Check sub error:`, e.message);
      }
    }

    if (allSubscribed) {
      markUserVerified(ctx.from.id);
      await ctx.answerCallbackQuery({ text: "✅ Verified. You can now continue." });
      const { mainMenuKeyboard } = await import("../keyboards/menu.js");
      await ctx.editMessageText(
        "✅ <b>Subscription verified!</b>\n\nYou can now use Linkochie normally.\n\nChoose an action below and start saving your links.",
        { parse_mode: "HTML", reply_markup: mainMenuKeyboard() }
      );
      return;
    }

    await ctx.answerCallbackQuery({
      text: "❌ Please join all required channels first.",
      show_alert: true,
    });
  });

  // --- LINK ACTION BUTTONS ---
  bot.callbackQuery(/^note:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    setPending(ctx.from.id, "note", { id });
    await ctx.answerCallbackQuery();
    await ctx.reply("📝 Send me the note you want to attach to this link.");
  });

  bot.callbackQuery(/^cat:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const cats = getAllCategories(ctx.from.id);
    await ctx.answerCallbackQuery();
    await ctx.reply("🏷 Choose a category:", { reply_markup: categoryKeyboard(id, cats) });
  });

  bot.callbackQuery(/^setcat:(\d+):(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const idx = +ctx.match[2];
    const cats = getAllCategories(ctx.from.id);
    const cat = cats[idx];
    if (!cat) return ctx.answerCallbackQuery({ text: "Category list changed — try again", show_alert: true });

    updateCategory(id, ctx.from.id, cat);
    const link = getLink(id, ctx.from.id);
    await ctx.answerCallbackQuery({ text: `Set to ${cat}` });
    await ctx.editMessageText(linkCard(link), {
      parse_mode: "HTML",
      reply_markup: linkActionsKeyboard(id, link.url),
      disable_web_page_preview: true,
    });
  });

  bot.callbackQuery(/^newcat:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    setPending(ctx.from.id, "newcategory", { id });
    await ctx.answerCallbackQuery();
    await ctx.reply("✏️ Send a name for the new category.\nTip: start with an emoji, like <code>🍕 Food</code>", { parse_mode: "HTML" });
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
    await ctx.reply("⏰ When should I remind you?", { reply_markup: reminderKeyboard(id) });
  });

  bot.callbackQuery(/^setrem:(\d+):(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    const minutes = +ctx.match[2];
    const when = Math.floor(Date.now() / 1000) + minutes * 60;
    addReminder(id, ctx.from.id, when);
    await ctx.answerCallbackQuery({ text: "✅ Reminder set" });
    await ctx.editMessageText(`⏰ Reminder set for <b>${new Date(when * 1000).toLocaleString()}</b>`, { parse_mode: "HTML" });
  });

  bot.callbackQuery(/^customrem:(\d+)$/, async (ctx) => {
    const id = +ctx.match[1];
    setPending(ctx.from.id, "customremind", { id });
    await ctx.answerCallbackQuery();
    await ctx.reply("✏️ Send a time like:\n• <code>30m</code> — 30 minutes\n• <code>2h</code> — 2 hours\n• <code>3d</code> — 3 days\n• <code>2026-10-10 09:00</code> — exact date", { parse_mode: "HTML" });
  });

  bot.callbackQuery(/^cancelrem:(\d+)$/, async (ctx) => {
    clearPending(ctx.from.id);
    await ctx.answerCallbackQuery({ text: "Cancelled" });
    await ctx.deleteMessage().catch(() => {});
  });
}