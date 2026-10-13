// src/middlewares/subscription.js
import { InlineKeyboard } from "grammy";
import { config } from "../config.js";

const verifiedUsers = new Map();

function isVerifiedRecently(userId) {
  const value = verifiedUsers.get(userId);
  if (!value) return false;

  if (Date.now() - value > 10 * 60 * 1000) {
    verifiedUsers.delete(userId);
    return false;
  }

  return true;
}

export function markUserVerified(userId) {
  if (!userId) return;
  verifiedUsers.set(userId, Date.now());
}

export function buildSubscriptionNotice() {
  return (
    "📣 <b>Finish your access setup</b>\n\n" +
    "Before you can use Linkochie, please join the required channel(s) below.\n" +
    "Once joined, tap <b>✅ Check Subscription</b> to verify access and continue."
  );
}

export function joinKeyboard() {
  const kb = new InlineKeyboard();
  const requiredChannels = Array.isArray(config.requiredChannels) ? config.requiredChannels : [];

  requiredChannels.forEach((channel, i) => {
    const name = String(channel).replace("@", "").replace("-100", "Channel ").replace("_", " ");
    kb.url(`📢 Join ${name}`, `https://t.me/${String(channel).replace("@", "")}`);
    if ((i + 1) % 2 === 0) kb.row();
  });

  if (requiredChannels.length > 0) {
    kb.row().text("✅ Check Subscription", "check_sub");
  }

  return kb;
}

export async function checkSubscription(ctx, next) {
  const requiredChannels = Array.isArray(config.requiredChannels) ? config.requiredChannels : [];
  const userId = ctx.from?.id;
  const text = ctx.message?.text ?? "";
  const command = text.split(" ")[0];
  const adminCommandNames = ["/help", "/stats", "/admin", "/listusers", "/export", "/check_sub"];
  const isAdminUser = userId && Number(config.adminId || 0) === Number(userId);

  if (userId && isVerifiedRecently(userId)) {
    return next();
  }

  if (isAdminUser || adminCommandNames.includes(command) || ctx.callbackQuery?.data === "check_sub") {
    return next();
  }

  if (requiredChannels.length === 0) {
    return next();
  }

  let allSubscribed = true;
  for (const channel of requiredChannels) {
    try {
      const member = await ctx.api.getChatMember(channel, userId);
      if (["left", "kicked"].includes(member.status)) {
        allSubscribed = false;
        break;
      }
    } catch (e) {
      console.warn(`Ignoring subscription channel ${channel}:`, e.message);
      allSubscribed = false;
      break;
    }
  }

  if (!allSubscribed) {
    return ctx.reply(buildSubscriptionNotice(), {
      parse_mode: "HTML",
      reply_markup: joinKeyboard(),
    });
  }

  markUserVerified(userId);
  await next();
}