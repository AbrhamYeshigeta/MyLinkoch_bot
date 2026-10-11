import { test, expect } from "bun:test";
import { buildWelcomeMessage } from "./start.js";

test("welcome message stays clean and does not include the subscription prompt", () => {
  const text = buildWelcomeMessage();

  expect(text).toContain("Welcome to Linkochie");
  expect(text).not.toContain("Join our channels to continue");
});
