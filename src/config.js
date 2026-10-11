import "dotenv/config";

if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing in .env");
  process.exit(1);
}

export const config = {
  botToken: process.env.BOT_TOKEN,
  dbPath: "data/linkochie.db",
  fetchTimeoutMs: 8000,
  requiredChannels: [
    "@Rex_Portfolio",
    "@linkochie_news",
  ],

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
