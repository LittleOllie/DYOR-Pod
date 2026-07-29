import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Crypto conversations worth tuning in for",
  );
});

test("mobile navigation opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: /Open menu/i }).click();
  await expect(page.getByRole("dialog", { name: /Mobile navigation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Schedule" })).toBeVisible();
});

test("Spotify CTA works", async ({ page }) => {
  await page.goto("/");
  const spotifyLink = page.getByRole("link", { name: /Listen on Spotify/i }).first();
  await expect(spotifyLink).toHaveAttribute("href", /spotify\.com/);
});

test("newsletter shows error when not configured", async ({ page }) => {
  await page.goto("/#newsletter");
  await page.getByLabel(/Email address/i).fill("test@example.com");
  await page.getByRole("button", { name: /Join the Briefing/i }).click();
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
});

test("no horizontal overflow at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow).toBe(false);
});
