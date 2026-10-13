import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
const envFile = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const envValues = Object.fromEntries(
  envFile
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return null;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      return [key, value];
    })
    .filter(Boolean)
);

for (const [key, value] of Object.entries(envValues)) {
  if (process.env[key] === undefined || process.env[key] === "") {
    process.env[key] = value;
  }
}

if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing in .env");
  process.exit(1);
}

const requiredChannelsFromEnv = (process.env.REQUIRED_CHANNELS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const config = {
  botToken: process.env.BOT_TOKEN,
  dbPath: "data/linkochie.db",
  fetchTimeoutMs: 8000,
  adminId: Number(process.env.ADMIN_ID) || 0,
  requiredChannels: requiredChannelsFromEnv,

  // Universal defaults — anyone can use these out of the box
  defaultCategories: [
    "📚 Learning",
    "💼 Work",
    "🛒 Shopping",
    "📺 Videos",
    "📰 Articles",
    "🎵 Music",
    "🍔 Food",
    "✈️ Travel",
    "🏋️ Health",
    "💰 Finance",
    "🎮 Games",
    "🔧 Tools",
    "⭐ Important",
    "📁 Unsorted",
  ],

  fallbackCategory: "📁 Unsorted",
  maxCategoryNameLength: 30,
  maxCategoriesPerUser: 40,
};