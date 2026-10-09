import { searchLinks } from "../db/queries.js";

export function registerSearch(bot) {
  bot.command("search", (ctx) => {
    const q = ctx.match?.trim();
    if (!q) return ctx.reply("Usage: /search react native");

    const rows = searchLinks(ctx.from.id, q);
    if (!rows.length) return ctx.reply(`No results for "${q}".`);

    const text = rows.map((r, i) =>
      `${i + 1}. <b>${r.title}</b>${r.favorite ? " ⭐" : ""}\n` +
      `   📂 ${r.category}  ·  #${r.id}\n` +
      (r.note ? `   📝 <i>${r.note}</i>\n` : "") +
      `   ${r.url}`
    ).join("\n\n");

    ctx.reply(`🔎 <b>${rows.length} results</b>\n\n${text}`, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  });
}