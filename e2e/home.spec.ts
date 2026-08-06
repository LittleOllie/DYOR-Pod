import { test, expect, type Page } from "@playwright/test";

async function dismissLogoIntro(page: Page) {
  const skipIntro = page.getByRole("button", { name: /Skip intro/i });
  if (await skipIntro.isVisible().catch(() => false)) {
    await skipIntro.click();
    return;
  }

  await skipIntro.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  if (await skipIntro.isVisible().catch(() => false)) {
    await skipIntro.click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await dismissLogoIntro(page);
});

test("homepage loads", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Crypto conversations worth tuning in for",
  );
});

test("mobile navigation opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: /Open menu/i }).click();
  await expect(page.getByRole("dialog", { name: /Mobile navigation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Weekly Schedule" })).toBeVisible();
});

test("Spotify link available on desktop podcast section", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/#podcast");
  await dismissLogoIntro(page);
  const spotifyLink = page.getByRole("link", { name: /Listen on Spotify/i }).first();
  await expect(spotifyLink).toHaveAttribute("href", /spotify\.com/);
});

test("newsletter shows error when not configured", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/#newsletter");
  await page.locator("#newsletter-email-mobile").fill("test@example.com");
  await page
    .locator("#newsletter-email-mobile")
    .locator("xpath=ancestor::form[1]")
    .getByRole("button", { name: /Join the Briefing/i })
    .click();
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
});

test("no horizontal overflow at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await dismissLogoIntro(page);
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow).toBe(false);
});

const desktopWidths = [1024, 1280, 1440, 1728, 1920, 2560] as const;

for (const width of desktopWidths) {
  test(`no horizontal overflow at ${width}px desktop width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await dismissLogoIntro(page);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const logo = document.querySelector(".site-logo img, .site-logo svg, .site-logo a");
      const logoRect = logo?.getBoundingClientRect();
      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        logoLeft: logoRect?.left ?? null,
      };
    });

    expect(metrics.overflow).toBeLessThanOrEqual(2);
    expect(metrics.logoLeft).not.toBeNull();
    expect(metrics.logoLeft!).toBeGreaterThanOrEqual(12);
  });
}

test("desktop spaces library shows archive cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#library");
  await dismissLogoIntro(page);

  const grid = page.getByLabel("Space archive by show");
  await expect(grid).toBeVisible();
  await expect(grid.locator("article")).toHaveCount(3);
  await expect(grid.getByRole("heading", { name: "DYOR Sunday" })).toBeVisible();
});

test("desktop hosts render individual profile cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#hosts");
  await dismissLogoIntro(page);

  const grid = page.locator(".host-grid");
  await expect(grid).toBeVisible();
  await expect(grid.locator("article")).toHaveCount(3);
});

test("desktop newsletter input is wider than submit button at 1920px", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/#newsletter");
  await dismissLogoIntro(page);

  const sizes = await page.evaluate(() => {
    const input = document.getElementById("newsletter-email-desktop") as HTMLInputElement | null;
    const button = document
      .getElementById("newsletter-email-desktop")
      ?.closest("form")
      ?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (!input || !button) return null;
    return {
      inputWidth: input.getBoundingClientRect().width,
      buttonWidth: button.getBoundingClientRect().width,
    };
  });

  expect(sizes).not.toBeNull();
  expect(sizes!.inputWidth).toBeGreaterThan(sizes!.buttonWidth);
  expect(sizes!.inputWidth).toBeGreaterThan(240);
  expect(sizes!.buttonWidth).toBeLessThanOrEqual(280);
});
