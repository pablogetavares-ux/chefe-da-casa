import { afterEach, describe, expect, it, vi } from "vitest";

describe("getLaunchReadiness", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("marca código como completo e lista passos externos", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "Chefe da Casa");
    vi.stubEnv("NODE_ENV", "development");

    const { getLaunchReadiness } =
      await import("@/lib/runtime/launch-readiness");
    const launch = getLaunchReadiness();

    expect(launch.codeComplete).toBe(true);
    expect(launch.readyToLaunch).toBe(false);
    expect(launch.externalStepsRemaining).toBeGreaterThan(0);
    expect(launch.checklist.some((s) => s.id === "vercel-domain")).toBe(true);
    expect(launch.urls.stripeWebhook).toContain("/api/webhooks/stripe");
  }, 15_000);

  it("detecta Stripe live mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "Chefe da Casa");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_test123");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.stubEnv("STRIPE_PRICE_PRO", "price_pro");
    vi.stubEnv("STRIPE_PRICE_FAMILY", "price_family");
    vi.stubEnv("OPENAI_API_KEY", "sk-openai");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    vi.stubEnv("ADMIN_EMAILS", "admin@test.com");
    vi.stubEnv("AI_DEV_MOCK", "false");
    vi.stubEnv("BILLING_DEV_MOCK", "false");

    const { getLaunchReadiness } =
      await import("@/lib/runtime/launch-readiness");
    const launch = getLaunchReadiness();

    expect(launch.stripe.liveMode).toBe(true);
    expect(launch.urls.authCallback).toBe(
      "https://app.example.com/auth/callback",
    );
  });
});
