import { fetchMetadata } from "../services/metadata.js";
import { guessCategory, guessTags } from "../services/categorize.js";
import { insertLink, getLink } from "../db/queries.js";
import { linkActionsKeyboard } from "../keyboards/linkActions.js";
import { linkCard } from "../utils/format.js";
import { logger } from "../utils/logger.js";
import { incrementUserLinks } from "../middlewares/trackUsers.js";

const URL_RE = /https?:\/\/[^\s<>"']+/i;


export function registerSave(bot) {
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith("/")) return next();

    const match = text.match(URL_RE);
    if (!match) return next();

    const url = match[0];
    const note = text.replace(url, "").trim();
    const userId = ctx.from.id;

    const loading = await ctx.reply("🔎 Fetching metadata…");
    const meta = await fetchMetadata(url);
    const category = guessCategory(url, meta.title);
    const tags = guessTags(meta.title, meta.description).join(", ");

    const id = insertLink({
      user_id: userId,
      url,
      title: meta.title,
      description: meta.description,
      domain: meta.domain,
      category,
      tags,
      note,
    });

    incrementUserLinks(ctx.from.id);

    const link = getLink(id, userId);

    try {
      await ctx.api.editMessageText(
        ctx.chat.id,
        loading.message_id,
        linkCard(link),
        {
          parse_mode: "HTML",
          reply_markup: linkActionsKeyboard(id, url),
          disable_web_page_preview: true,
        }
      );
    } catch (e) {
      logger.error("edit failed:", e.message);
      await ctx.reply(linkCard(link), {
        parse_mode: "HTML",
        reply_markup: linkActionsKeyboard(id, url),
        disable_web_page_preview: true,
      });
    }
  });
}