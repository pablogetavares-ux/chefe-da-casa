import { describe, expect, it, vi } from "vitest";

import {
  captchaAuthOptions,
  isCaptchaEnabled,
  validateCaptchaToken,
} from "@/lib/auth/captcha";

describe("auth captcha", () => {
  it("desabilitado sem site key", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    expect(isCaptchaEnabled()).toBe(false);
    expect(validateCaptchaToken(undefined)).toBeNull();
    expect(captchaAuthOptions(undefined)).toBeUndefined();
    vi.unstubAllEnvs();
  });

  it("exige token quando habilitado", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    expect(isCaptchaEnabled()).toBe(true);
    expect(validateCaptchaToken(undefined)?.error).toMatch(/segurança/);
    expect(captchaAuthOptions("token-abc")).toEqual({
      captchaToken: "token-abc",
    });
    vi.unstubAllEnvs();
  });
});
