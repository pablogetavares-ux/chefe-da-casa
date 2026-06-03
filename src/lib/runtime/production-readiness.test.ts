import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getProductionReadiness", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "Chef da Casa AI");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("marca blockers em produção sem OpenAI", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AI_DEV_MOCK", "false");
    vi.stubEnv("BILLING_DEV_MOCK", "false");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("ADMIN_EMAILS", "admin@test.com");

    const { getProductionReadiness } =
      await import("@/lib/runtime/production-readiness");
    const readiness = getProductionReadiness();

    expect(readiness.environment).toBe("production");
    expect(readiness.blockers.some((b) => b.includes("OPENAI"))).toBe(true);
    expect(readiness.readyForProduction).toBe(false);
  }, 15_000);

  it("nunca permite mocks em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AI_DEV_MOCK", "true");
    vi.stubEnv("BILLING_DEV_MOCK", "true");
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("ADMIN_EMAILS", "admin@test.com");

    const { getProductionReadiness } =
      await import("@/lib/runtime/production-readiness");
    const readiness = getProductionReadiness();

    expect(readiness.mocks.aiDevMock).toBe(false);
    expect(readiness.mocks.billingDevMock).toBe(false);
  });
});
