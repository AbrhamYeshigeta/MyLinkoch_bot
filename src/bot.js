// src/bot.js
import { Bot } from "grammy";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

import { registerStart } from "./handlers/start.js";
import { registerMyLinks } from "./handlers/myLinks.js";
import { registerSearch } from "./handlers/search.js";
import { registerDelete } from "./handlers/delete.js";
import { registerCategories } from "./handlers/categories.js";
import { registerCallbacks } from "./handlers/callbacks.js";
import { registerPending } from "./handlers/pending.js";
import { registerSave } from "./handlers/save.js";
import { checkSubscription } from "./middlewares/subscription.js"; 

export function createBot() {
  const bot = new Bot(config.botToken);

  // 1. Logger
  bot.use(async (ctx, next) => {
    const u = ctx.from?.id;
    const txt = ctx.message?.text ?? ctx.callbackQuery?.data ?? "";
    logger.info(`[${u}] ${txt.slice(0, 60)}`);
    await next();
  });

  bot.catch((err) => logger.error("bot error:", err.message));

  // 2. Subscription gate must run before any button or action is processed.
  // This keeps the /start welcome flow separate from the join-channel gate.
  bot.use(checkSubscription);

  // 3. Commands & Menu Buttons
  registerStart(bot);
  registerMyLinks(bot);
  registerSearch(bot);
  registerDelete(bot);
  registerCategories(bot);
  registerCallbacks(bot);

  // 4. Save & Pending (Requires subscription to work)
  registerPending(bot);
  registerSave(bot);

  // 5. Fallback
  bot.on("message:text", (ctx) => {
    ctx.reply("💡 Send me a link and I'll save it. Or type /help.");
  });

  return bot;
}