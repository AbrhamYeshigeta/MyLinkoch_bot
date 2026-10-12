import { test, expect } from "bun:test";
import { config } from "../config.js";
import { checkSubscription, markUserVerified } from "./subscription.js";

test("start command bypasses subscription gate", async () => {
  let nextCalled = false;
  const ctx = {
    message: { text: "/start" },
    from: { id: 42 },
    api: { getChatMember: async () => ({ status: "left" }) },
    reply: () => {},
  };

  await checkSubscription(ctx, () => {
    nextCalled = true;
  });

  expect(nextCalled).toBe(true);
});

test("button action triggers subscription page when unsubscribed", async () => {
  const originalRequiredChannels = config.requiredChannels;
  config.requiredChannels = ["@example_channel"];

  let nextCalled = false;
  let replyText = "";
  const ctx = {
    callbackQuery: { data: "my_links" },
    from: { id: 42 },
    api: {
      getChatMember: async () => ({ status: "left" }),
    },
    reply: (text) => {
      replyText = text;
    },
  };

  try {
    await checkSubscription(ctx, () => {
      nextCalled = true;
    });
  } finally {
    config.requiredChannels = originalRequiredChannels;
  }

  expect(nextCalled).toBe(false);
  expect(replyText).toContain("Finish your access setup");
  expect(replyText).toContain("Check Subscription");
});

test("recently verified users do not see the access page again", async () => {
  let nextCalled = false;
  markUserVerified(99);

  const ctx = {
    callbackQuery: { data: "my_links" },
    from: { id: 99 },
    api: {
      getChatMember: async () => ({ status: "left" }),
    },
    reply: () => {
      throw new Error("subscription page should not appear");
    },
  };

  await checkSubscription(ctx, () => {
    nextCalled = true;
  });

  expect(nextCalled).toBe(true);
});

test("admin commands bypass the channel gate", async () => {
  let nextCalled = false;
  const ctx = {
    message: { text: "/stats" },
    from: { id: 6909025941 },
    api: {
      getChatMember: async () => {
        throw new Error("channel check should not run for admin commands");
      },
    },
    reply: () => {
      throw new Error("admin commands should not trigger subscription prompt");
    },
  };

  await checkSubscription(ctx, () => {
    nextCalled = true;
  });

  expect(nextCalled).toBe(true);
});
