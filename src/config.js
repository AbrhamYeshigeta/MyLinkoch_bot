import "dotenv/config";

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
