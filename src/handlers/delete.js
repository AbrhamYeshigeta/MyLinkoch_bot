import { deleteLink } from "../db/queries.js";

export function registerDelete(bot) {
  bot.command("delete", (ctx) => {
    const id = parseInt(ctx.match, 10);
    if (!id) return ctx.reply("Usage: /delete 12");
    const changes = deleteLink(id, ctx.from.id);
    ctx.reply(changes ? `🗑 Deleted #${id}` : `Not found: #${id}`);
  });
}