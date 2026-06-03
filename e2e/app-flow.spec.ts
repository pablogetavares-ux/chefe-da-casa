import { expect, test } from "@playwright/test";

import {
  canRunAi,
  dismissOnboarding,
  hasSupabase,
  assertDashboardVisible,
  logoutFromApp,
  prepareAppSession,
} from "./helpers";

const testPassword = "UiTest123!";

test.describe("Marketing e auth", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (!hasSupabase) {
      testInfo.skip(
        true,
        "Supabase não configurado — defina NEXT_PUBLIC_SUPABASE_*",
      );
      return;
    }
    await prepareAppSession(page);
  });

  test("cadastro + logout + login (fluxo real)", async ({ page, isMobile }) => {
    const email = `ui.${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.locator("#fullName").fill("Chef UI Test");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(testPassword);
    await page.getByRole("button", { name: "Criar conta grátis" }).click();

    await page.waitForURL(/\/app/, { timeout: 20_000 });
    await dismissOnboarding(page);
    await assertDashboardVisible(page);

    await logoutFromApp(page, isMobile);

    await page.locator("#email").fill(email);
    await page.locator("#password").fill(testPassword);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/app/, { timeout: 20_000 });
  });
});

test.describe("Área logada", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (!hasSupabase) {
      testInfo.skip(true, "Supabase não configurado");
      return;
    }

    await prepareAppSession(page);

    const email = `flow.${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.locator("#fullName").fill("Chef Flow");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(testPassword);
    await page.getByRole("button", { name: "Criar conta grátis" }).click();
    await page.waitForURL(/\/app/, { timeout: 20_000 });
    await dismissOnboarding(page);
  });

  test("dashboard e navegação mobile", async ({ page, isMobile }) => {
    await assertDashboardVisible(page);

    if (isMobile) {
      await page.getByRole("link", { name: "Gerar", exact: true }).click();
    } else {
      await page.goto("/app/generate");
    }

    await page.waitForURL(/\/app\/generate/);
    await dismissOnboarding(page);
    await expect(
      page
        .locator("#main-content")
        .getByRole("heading", { name: /gerar receita/i }),
    ).toBeVisible();
  });

  test("geração de receita IA + favoritar (mock)", async ({
    page,
  }, testInfo) => {
    if (!canRunAi) {
      testInfo.skip(
        true,
        "Supabase ou AI_DEV_MOCK não configurados — necessário para geração IA",
      );
      return;
    }

    test.setTimeout(90_000);

    await page.goto("/app/generate");
    await dismissOnboarding(page);
    await page
      .getByPlaceholder("Adicionar ingrediente extra...")
      .fill("tomate");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: "Gerar com IA" }).click();
    await page.waitForURL(/\/app\/recipes\//, { timeout: 60_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: /favoritar/i }).click();
    await page.goto("/app/favorites");
    await expect(
      page.locator("#main-content").getByRole("heading", { name: /favorit/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page
        .locator("#main-content")
        .getByText(/tomate|receita/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
