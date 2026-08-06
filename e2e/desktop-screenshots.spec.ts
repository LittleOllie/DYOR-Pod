import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

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

const outputDir = path.join(process.cwd(), "e2e-screenshots");

for (const width of [1440, 1920, 2560] as const) {
  test(`capture desktop correction screenshots at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: Math.round(width * 0.625) });

    await page.goto("/");
    await dismissLogoIntro(page);
    await page.screenshot({
      path: path.join(outputDir, `header-${width}.png`),
      clip: { x: 0, y: 0, width, height: 120 },
    });

    await page.goto("/#library");
    await dismissLogoIntro(page);
    const library = page.getByLabel("Space archive by show");
    await expect(library).toBeVisible();
    await library.screenshot({
      path: path.join(outputDir, `library-${width}.png`),
    });

    await page.goto("/#hosts");
    await dismissLogoIntro(page);
    const hosts = page.locator(".host-grid");
    await expect(hosts).toBeVisible();
    await hosts.screenshot({
      path: path.join(outputDir, `hosts-${width}.png`),
    });

    await page.goto("/#newsletter");
    await dismissLogoIntro(page);
    const newsletter = page.locator(".newsletter-inner");
    await expect(newsletter).toBeVisible();
    await newsletter.screenshot({
      path: path.join(outputDir, `newsletter-${width}.png`),
    });
  });
}
