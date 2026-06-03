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
    expect(body.service).toBe("chef-da-casa-ai");
  });

  test("pricing exibe planos", async ({ page }) => {
    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", { name: /escolha seu plano/i }),
    ).toBeVisible();
  });
});
