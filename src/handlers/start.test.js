import { test, expect } from "bun:test";
import { buildWelcomeMessage, buildHelpMessage } from "./start.js";

test("welcome message stays clean and does not include the subscription prompt", () => {
  const text = buildWelcomeMessage();

  expect(text).toContain("Welcome to Linkochie");
  expect(text).not.toContain("Join our channels to continue");
});

test("help message explains the main Linkoche bot services", () => {
  const text = buildHelpMessage();

  expect(text).toContain("/save");
  expect(text).toContain("/search");
  expect(text).toContain("My Links");
  expect(text).toContain("Categories");
});
