import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

async function skipLogoIntro(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("dyor-logo-intro-seen", "true");
  });
}

const outputDir = path.join(process.cwd(), "e2e-screenshots");

for (const width of [1440, 1920, 2560] as const) {
  test(`capture desktop correction screenshots at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: Math.round(width * 0.625) });
    await skipLogoIntro(page);

    await page.goto("/");
    await page.screenshot({
      path: path.join(outputDir, `header-${width}.png`),
      clip: { x: 0, y: 0, width, height: 120 },
    });

    await page.goto("/#library");
    const library = page.getByLabel("Space archive by show");
    await expect(library).toBeVisible();
    await library.screenshot({
      path: path.join(outputDir, `library-${width}.png`),
    });

    await page.goto("/#hosts");
    const hosts = page.locator(".host-grid");
    await expect(hosts).toBeVisible();
    await hosts.screenshot({
      path: path.join(outputDir, `hosts-${width}.png`),
    });

    await page.goto("/#newsletter");
    const newsletter = page.locator(".newsletter-inner");
    await expect(newsletter).toBeVisible();
    await newsletter.screenshot({
      path: path.join(outputDir, `newsletter-${width}.png`),
    });
  });
}
