export function registerStart(bot) {
  const menu = (ctx) =>
    ctx.reply(
      `👋 <b>Welcome to Linkochie!</b>\n\n` +
      `Send me any link and I'll save it with title, category and tags — automatically.\n\n` +
      `<b>Commands</b>\n` +
      `/my_links — browse by category\n` +
      `/search &lt;word&gt; — find saved links\n` +
      `/fav — favorites\n` +
      `/categories — view your categories\n` +
      `/addcategory &lt;name&gt; — add a custom category\n` +
      `/removecategory &lt;name&gt; — remove a custom category\n` +
      `/delete &lt;id&gt; — delete a link\n` +
      `/help — this menu`,
      { parse_mode: "HTML" }
    );

  bot.command("start", menu);
  bot.command("help", menu);
}