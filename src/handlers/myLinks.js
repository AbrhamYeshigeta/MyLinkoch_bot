// src/handlers/myLinks.js
import { listByCategory, listFavorites, listLinksForUser } from "../db/queries.js";
import { escapeHtml } from "../utils/format.js";

export function registerMyLinks(bot) {
  bot.command("my_links", (ctx) => {
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

    ctx.reply(text, { 
      parse_mode: "HTML", 
      disable_web_page_preview: true 
    });
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