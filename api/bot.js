import { webhookCallback } from "grammy";
import { createBot } from "../src/bot.js";

const bot = createBot();
const handleWebhook = webhookCallback(bot, "vercel");

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({
      ok: true,
      service: "MyLinks Bot",
      mode: "webhook",
      environment: process.env.VERCEL ? "vercel" : "local",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
      allowedMethods: ["POST", "GET"],
    });
    return;
  }

  return handleWebhook(req, res);
}