import { test, expect } from "bun:test";
import { buildWelcomeMessage, buildHelpMessage, shouldShowAdminDashboard } from "./start.js";
import { mainMenuKeyboard } from "../keyboards/menu.js";

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

test("admin dashboard visibility is restricted to the configured admin user", () => {
  expect(shouldShowAdminDashboard(6909025941)).toBe(true);
  expect(shouldShowAdminDashboard(123456789)).toBe(false);
  expect(shouldShowAdminDashboard(undefined)).toBe(false);
});

test("main menu exposes the admin dashboard only for the configured admin user", () => {
  const adminMenu = mainMenuKeyboard(6909025941);
  const userMenu = mainMenuKeyboard(123456789);

  const adminButtons = adminMenu.inline_keyboard.flat().map((button) => button.text);
  const userButtons = userMenu.inline_keyboard.flat().map((button) => button.text);

  expect(adminButtons).toContain("👑 Admin Dashboard");
  expect(userButtons).not.toContain("👑 Admin Dashboard");
});
