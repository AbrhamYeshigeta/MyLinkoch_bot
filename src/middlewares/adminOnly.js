import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export async function adminOnly(ctx, next) {
  const userId = ctx.from?.id;

  if (!config.adminId) {
    logger.warn("ADMIN_ID not set — admin command blocked");
    return ctx.reply("⚠️ Admin access not configured.");
  }

  if (userId !== config.adminId) {
    logger.warn(`⛔ Unauthorized admin attempt by ${userId}`);
    return ctx.reply(
      "🔒 <b>Access denied</b>\n\nThis command is only available to the bot administrator.",
      { parse_mode: "HTML" }
    );
  }

  logger.info(`👑 Admin ${userId} ran: ${ctx.message?.text}`);
  await next();
}