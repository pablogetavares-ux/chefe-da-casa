import { expect, type Page } from "@playwright/test";

const ONBOARDING_KEY = "chef-onboarding-v1";

/** Evita modal de onboarding bloquear cliques nos testes E2E. */
export async function prepareAppSession(page: Page) {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "1");
  }, ONBOARDING_KEY);
}

/** Fecha onboarding modal se ainda aparecer (ex.: localStorage limpo). */
export async function dismissOnboarding(page: Page) {
  const dialog = page.getByRole("dialog");
  const skip = dialog.getByRole("button", { name: /^Pular$/i });
  if (await skip.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await skip.click();
    await dialog.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => {});
  }
}

export const hasSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** IA funciona em dev com mock mesmo sem service role (audit via sessão autenticada). */
export const canRunAi =
  hasSupabase &&
  (Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().length) ||
    process.env.AI_DEV_MOCK === "true");

export async function assertDashboardVisible(page: Page) {
  const main = page.locator("#main-content");
  await expect(
    main.getByRole("heading", { name: /o que vamos cozinhar/i }),
  ).toBeVisible();
}

export async function logoutFromApp(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
  }
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL(/\/login/, { timeout: 15_000 });
}
