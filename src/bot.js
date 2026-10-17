// src/bot.js
import { Bot, InlineKeyboard } from "grammy";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

// --- Import Handlers ---
import { registerStart } from "./handlers/start.js";
import { registerMyLinks } from "./handlers/myLinks.js";
import { registerSearch } from "./handlers/search.js";
import { registerDelete } from "./handlers/delete.js";
import { registerCategories } from "./handlers/categories.js";
import { registerCallbacks } from "./handlers/callbacks.js";
import { registerPending } from "./handlers/pending.js";
import { registerSave } from "./handlers/save.js";
import { registerStats } from "./handlers/stats.js";

// --- Import Middlewares ---
import { checkSubscription, markUserVerified } from "./middlewares/subscription.js"; 
import { trackUsers } from "./middlewares/trackUsers.js";
import { adminOnly } from "./middlewares/adminOnly.js"; // <-- ADD THIS

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

  // 2. Track Users (Move this BEFORE subscription so new users get tracked)
  bot.use(trackUsers());

  // 3. Subscription Gate
  bot.use(checkSubscription);

  // 4. Handle the "Check Subscription" button!
  // This runs AFTER the gate. If they passed the gate, they get verified here.
  bot.callbackQuery("check_sub", async (ctx) => {
    markUserVerified(ctx.from.id);
    await ctx.answerCallbackQuery({ text: "✅ Access granted!" });
    await ctx.editMessageText("✅ Subscription verified! You can now use Linkochie. Send /start to begin.");
  });

  // 5. Admin Dashboard Command (FIXED)
  bot.command("admin", adminOnly, async (ctx) => {
    const kb = new InlineKeyboard()
      .text("📊 Bot Stats", "admin_stats")
      .text("📢 Broadcast", "admin_broadcast")
      .row()
      .text("👥 User List", "admin_users");
      
    await ctx.reply("👑 <b>Admin Dashboard</b>\n\nWelcome, boss. What do you want to do?", {
      parse_mode: "HTML",
      reply_markup: kb,
    });
  });

  // 6. Commands & Menu Buttons
  registerStart(bot);
  registerMyLinks(bot);
  registerSearch(bot);
  registerDelete(bot);
  registerCategories(bot);
  registerCallbacks(bot);
  registerStats(bot);

  // 7. Save & Pending
  registerPending(bot);
  registerSave(bot);

  // 8. Fallback
  bot.on("message:text", (ctx) => {
    ctx.reply("💡 Send me a link and I'll save it. Or type /help.");
  });

  return bot;
}