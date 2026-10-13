import { webhookCallback } from "grammy";
import { createBot } from "../src/bot.js";

const bot = createBot();

// This is the correct adapter for Vercel Node.js Serverless Functions
export default webhookCallback(bot, "https");