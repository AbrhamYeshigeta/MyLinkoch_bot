const RULES = [
  { cat: "📺 Videos",   match: ["youtube.com", "youtu.be", "vimeo.com", "twitch.tv", "tiktok.com"] },
  { cat: "🛒 Shopping", match: ["amazon.", "ebay.", "aliexpress.", "etsy.com", "shein.com", "walmart.com"] },
  { cat: "📚 Learning", match: ["coursera.org", "udemy.com", "freecodecamp.org", "khanacademy.org", "edx.org", "duolingo.com"] },
  { cat: "💰 Finance",  match: ["paypal.com", "stripe.com", "wise.com", "binance.com", "coinbase.com", "chase.com"] },
  { cat: "🎵 Music",    match: ["spotify.com", "soundcloud.com", "music.apple.com", "deezer.com"] },
  { cat: "🎮 Games",    match: ["steam", "epicgames.com", "playstation.com", "xbox.com", "roblox.com"] },
  { cat: "✈️ Travel",   match: ["booking.com", "airbnb.", "expedia.", "tripadvisor.", "skyscanner."] },
  { cat: "🏋️ Health",   match: ["myfitnesspal.com", "strava.com", "whoop.com", "fitbit.com"] },
  { cat: "🍔 Food",     match: ["allrecipes.com", "foodnetwork.com", "doordash.com", "ubereats.com"] },
  { cat: "📰 Articles", match: ["medium.com", "substack.com", "nytimes.com", "bbc.com", "cnn.com", "theguardian.com"] },
  { cat: "💼 Work",     match: ["linkedin.com", "indeed.com", "glassdoor.com", "wellfound.com", "upwork.com", "fiverr.com"] },
  { cat: "🔧 Tools",    match: ["github.com", "gitlab.com", "stackoverflow.com", "notion.so", "trello.com", "figma.com", "docs.google.com"] },
];

const TAG_KEYWORDS = {
  tutorial: ["tutorial", "guide", "how to"],
  review:   ["review", "vs", "comparison"],
  news:     ["breaking", "announced", "launch"],
  deal:     ["sale", "discount", "coupon", "deal"],
  recipe:   ["recipe", "ingredients", "cook"],
  workout:  ["workout", "exercise", "training"],
};

export function guessCategory(url, title = "") {
  const text = (url + " " + title).toLowerCase();
  for (const r of RULES) {
    if (r.match.some((m) => text.includes(m))) return r.cat;
  }
  return "📁 Unsorted";
}

export function guessTags(title = "", description = "") {
  const text = (title + " " + description).toLowerCase();
  const tags = [];
  for (const [tag, kws] of Object.entries(TAG_KEYWORDS)) {
    if (kws.some((k) => text.includes(k))) tags.push(tag);
  }
  return tags.slice(0, 5);
}