import { listByCategory, listFavorites } from "../db/queries.js";

export function registerMyLinks(bot) {
  bot.command("my_links", (ctx) => {
    const rows = listByCategory(ctx.from.id);
    if (!rows.length) return ctx.reply("You have no links yet. Send me one! 📎");

    const total = rows.reduce((s, r) => s + r.count, 0);
    const text =
      `📚 <b>MY SAVED LINKS</b> (${total})\n\n` +
      rows.map((r) => `${r.category} — <b>${r.count}</b>`).join("\n");

    ctx.reply(text, { parse_mode: "HTML" });
  });

  bot.command("fav", (ctx) => {
    const rows = listFavorites(ctx.from.id);
    if (!rows.length) return ctx.reply("No favorites yet ⭐");

    const text = rows.map((r, i) =>
      `${i + 1}. <b>${r.title}</b>\n   📂 ${r.category}  ·  #${r.id}\n   ${r.url}`
    ).join("\n\n");

    ctx.reply(`⭐ <b>Favorites</b>\n\n${text}`, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  });
}