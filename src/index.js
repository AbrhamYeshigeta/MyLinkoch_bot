import { createBot } from "./bot.js";
import { startReminders } from "./services/reminders.js";
import { logger } from "./utils/logger.js";

const bot = createBot();
startReminders(bot);

bot
  .start({
    drop_pending_updates: true,
    onStart: (info) =>
      logger.info(`✅ @${info.username} is running. Press Ctrl+C to stop.`),
  })
  .catch((error) => {
    logger.error("❌ Bot startup failed. Check your BOT_TOKEN and Telegram API access.");
    logger.error(error?.message ?? String(error));
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());