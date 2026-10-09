import * as cheerio from "cheerio";
import { config } from "../config.js";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchMetadata(url) {
  const fallback = {
    title: safeHost(url),
    description: "",
    image: "",
    domain: safeHost(url),
  };

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(config.fetchTimeoutMs),
    });
    if (!res.ok) return fallback;

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").first().text().trim() ||
      fallback.title;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const image = $('meta[property="og:image"]').attr("content") || "";

    return {
      title: title.slice(0, 200),
      description: description.replace(/\s+/g, " ").slice(0, 280),
      image,
      domain: safeHost(url),
    };
  } catch {
    return fallback;
  }
}

function safeHost(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); }
  catch { return u; }
}