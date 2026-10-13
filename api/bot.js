import { webhookCallback } from "grammy";
import { createBot } from "../src/bot.js";

const bot = createBot();
const handleWebhook = webhookCallback(bot, "https");

export default async function handler(req, res) {
  const method = req?.method ?? "GET";

  if (method === "GET") {
    res.status(200).json({
      ok: true,
      service: "MyLinks Bot",
      mode: "webhook",
      environment: process.env.VERCEL ? "vercel" : "local",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
      allowedMethods: ["POST", "GET"],
    });
    return;
  }

  const safeReq = req && typeof req === "object" ? req : { method: "POST", headers: {} };
  safeReq.headers = safeReq.headers ?? {};

  return handleWebhook(safeReq, res);
}