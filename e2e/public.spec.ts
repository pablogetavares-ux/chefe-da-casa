import { expect, test } from "@playwright/test";

test.describe("Marketing público", () => {
  test("landing e páginas públicas carregam", async ({ page }) => {
    for (const path of ["/", "/login", "/signup", "/pricing"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("health API responde", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body.checks?.app).toBe("ok");
    expect(body.service).toBe("chefe-da-casa");
  });

  test("landing exibe posicionamento principal", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /receitas, compras e economia inteligente/i,
      }),
    ).toBeVisible();
  });

  test("landing possui seções principais", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#beneficios")).toBeVisible();
    await expect(page.locator("#recursos")).toBeVisible();
    await expect(page.locator("#central-ofertas")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /economize em toda a rotina/i }),
    ).toBeVisible();
    await expect(page.locator("#planos")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();
    await expect(page.locator("#cta-final")).toBeVisible();
  });

  test("pricing exibe planos", async ({ page }) => {
    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", {
        name: /investimento claro para a rotina/i,
      }),
    ).toBeVisible();
  });
});
