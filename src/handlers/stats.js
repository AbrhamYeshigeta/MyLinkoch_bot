import { db } from "../db/index.js";
import { adminOnly } from "../middlewares/adminOnly.js";

export function registerStats(bot) {
  async function showAdminDashboard(ctx) {
    const now = Math.floor(Date.now() / 1000);
    const day = 86400;

    const totalUsers     = db.prepare(`SELECT COUNT(*) c FROM users`).get().c;
    const startedBot     = db.prepare(`SELECT COUNT(*) c FROM users WHERE start_count > 0`).get().c;
    const activeToday    = db.prepare(`SELECT COUNT(*) c FROM users WHERE last_seen >= ?`).get(now - day).c;
    const activeWeek     = db.prepare(`SELECT COUNT(*) c FROM users WHERE last_seen >= ?`).get(now - 7 * day).c;
    const newToday       = db.prepare(`SELECT COUNT(*) c FROM users WHERE first_seen >= ?`).get(now - day).c;
    const newWeek        = db.prepare(`SELECT COUNT(*) c FROM users WHERE first_seen >= ?`).get(now - 7 * day).c;
    const totalLinks     = db.prepare(`SELECT COUNT(*) c FROM links`).get().c;
    const totalReminders = db.prepare(`SELECT COUNT(*) c FROM reminders WHERE sent = 0`).get().c;

    const topUsers = db.prepare(`
      SELECT username, first_name, user_id, links_saved
      FROM users ORDER BY links_saved DESC LIMIT 5
    `).all();

    const topCats = db.prepare(`
      SELECT category, COUNT(*) c FROM links
      GROUP BY category ORDER BY c DESC LIMIT 5
    `).all();

    const userList = topUsers.map((u, i) => {
      const name = u.username ? `@${u.username}` : u.first_name || `id:${u.user_id}`;
      return `${i + 1}. ${name} — ${u.links_saved} links`;
    }).join("\n") || "—";

    const catList = topCats.map((c) => `${c.category} — ${c.c}`).join("\n") || "—";

    const text =
      `👑 <b>Linkoche — Admin Dashboard</b>\n\n` +
      `👥 <b>Users</b>\n` +
      `• Total:          <b>${totalUsers}</b>\n` +
      `• Started bot:    <b>${startedBot}</b>\n` +
      `• Active today:   <b>${activeToday}</b>\n` +
      `• Active 7 days:  <b>${activeWeek}</b>\n` +
      `• New today:      <b>${newToday}</b>\n` +
      `• New this week:  <b>${newWeek}</b>\n\n` +
      `🔗 <b>Content</b>\n` +
      `• Links saved:    <b>${totalLinks}</b>\n` +
      `• Live reminders: <b>${totalReminders}</b>\n\n` +
      `🏆 <b>Top users</b>\n${userList}\n\n` +
      `📂 <b>Top categories</b>\n${catList}`;

    await ctx.reply(text, { parse_mode: "HTML" });
  }

  bot.command("stats", adminOnly, showAdminDashboard);
  bot.command("admin", adminOnly, showAdminDashboard);

  bot.command("listusers", adminOnly, async (ctx) => {
    const users = db.prepare(`
      SELECT user_id, username, first_name,
             datetime(first_seen, 'unixepoch') AS joined,
             links_saved, start_count
      FROM users ORDER BY first_seen DESC LIMIT 50
    `).all();

    if (!users.length) return ctx.reply("No users yet.");

    const lines = users.map((u, i) => {
      const name = u.username ? `@${u.username}` : u.first_name || `id:${u.user_id}`;
      return `${i + 1}. ${name}\n   📅 ${u.joined}  ·  🔗 ${u.links_saved}  ·  ▶️ ${u.start_count}`;
    }).join("\n\n");

    await ctx.reply(`👥 <b>Latest 50 users</b>\n\n${lines}`, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  });
}