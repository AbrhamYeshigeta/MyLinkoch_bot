import cron from "node-cron";
import { dueReminders, markReminderSent } from "../db/queries.js";
import { escapeHtml } from "../utils/format.js";
import { logger } from "../utils/logger.js";

export function startReminders(bot) {
  cron.schedule("* * * * *", async () => {
    const now = Math.floor(Date.now() / 1000);
    const due = dueReminders(now);

    for (const r of due) {
      const text =
        `⏰ <b>LINK REMINDER</b>\n\n` +
        `📌 <b>${escapeHtml(r.title)}</b>\n` +
        (r.note ? `📝 ${escapeHtml(r.note)}\n` : "") +
        `🔗 ${r.url}`;

      try {
        await bot.api.sendMessage(r.user_id, text, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (e) {
        logger.error(`reminder ${r.rid} failed:`, e.message);
      }
      markReminderSent(r.rid);
    }
  });

  logger.info("⏰ Reminders cron started");
}