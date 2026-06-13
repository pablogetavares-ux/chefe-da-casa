import { expect, test } from "@playwright/test";

/** Viewport aproximado do Motorola Moto G75 (412×915 CSS, Android 14). */
test.describe("Android Moto G75", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("chef-cookie-consent", "essential");
        localStorage.setItem("chef-onboarding-v1", "1");
      } catch {
        /* ignore */
      }
    });
  });

  test("landing carrega sem overflow horizontal", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("login acessível e legível", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /^entrar$/i })).toBeVisible();
    const email = page.getByLabel(/e-mail|email/i).first();
    await expect(email).toBeVisible();
    const box = await email.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40);
  });

  test("pricing e páginas públicas", async ({ page }) => {
    for (const path of ["/pricing", "/signup"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow).toBe(false);
    }
  });

  test("landing central de ofertas visível", async ({ page }) => {
    await page.goto("/#central-ofertas", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /central de ofertas/i }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test("redirect /app exige auth (não quebra layout)", async ({ page }) => {
    const res = await page.goto("/app", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
