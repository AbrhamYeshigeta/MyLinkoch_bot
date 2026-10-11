// src/handlers/start.js
import { InputFile } from "grammy";
import { mainMenuKeyboard } from "../keyboards/menu.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const welcomeImage = path.resolve(__dirname, "../../public/img/Linkoch_Bot.jpeg");

export function buildWelcomeMessage() {
  return (
    "👋 <b>Welcome to Linkochie!</b>\n\n" +
    "Your personal link memory. Save links, organize them by category, and keep important pages ready for later.\n\n" +
    "<b>Choose an action below:</b>"
  );
}

export function buildHelpMessage() {
  return (
    "📘 <b>Linkoche Bot Help</b>\n\n" +
    "Linkoche helps you save, organize, and quickly find useful links.\n\n" +
    "<b>What the bot can do</b>\n" +
    "• Save a link and add a note\n" +
    "• Search saved links by title, URL, category, note, or tag\n" +
    "• Open your saved links from <b>My Links</b>\n" +
    "• Organize everything with <b>Categories</b>\n" +
    "• Remove old or unwanted links\n" +
    "• Keep track of reminders and important pages\n\n" +
    "<b>Quick commands</b>\n" +
    "• /start — open the main menu\n" +
    "• /help — show this help message\n" +
    "• /save — save a link and note\n" +
    "• /search — find links by keyword, category, or note\n" +
    "• Use the menu buttons for <b>Save Link</b>, <b>Search</b>, <b>My Links</b>, and <b>Categories</b>\n\n" +
    "<b>How to use it</b>\n" +
    "1. Tap <b>Save Link</b> and send the website URL you want to keep.\n" +
    "2. Use <b>Search</b> to find links by keyword, category, or note.\n" +
    "3. Open <b>My Links</b> to review and manage your saved pages."
  );
}

export function registerStart(bot) {
  const sendMenu = async (ctx) => {
    const welcomeText = buildWelcomeMessage();

    try {
      await ctx.replyWithPhoto(new InputFile(welcomeImage), {
        caption: welcomeText,
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(),
      });
    } catch (e) {
      console.error("Image send failed:", e.message);
      await ctx.reply(welcomeText, {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(),
      });
    }
  };

  const sendHelp = async (ctx) => {
    const helpText = buildHelpMessage();

    try {
      await ctx.reply(helpText, {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(),
      });
    } catch (e) {
      console.error("Help message failed:", e.message);
      await ctx.reply(helpText, {
        parse_mode: "HTML",
      });
    }
  };

  bot.command("start", sendMenu);
  bot.command("help", sendHelp);
}