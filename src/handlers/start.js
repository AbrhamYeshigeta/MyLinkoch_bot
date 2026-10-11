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

  bot.command("start", sendMenu);
  bot.command("help", sendMenu);
}