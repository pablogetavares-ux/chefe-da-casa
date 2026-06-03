import { describe, expect, it, vi } from "vitest";

describe("gemini config", () => {
  it("desligado sem GEMINI_API_KEY", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.resetModules();
    const { isGeminiConfigured, isRecipeImageGenerationEnabled } =
      await import("@/lib/ai/gemini/config");
    expect(isGeminiConfigured()).toBe(false);
    expect(isRecipeImageGenerationEnabled()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("ligado com chave configurada", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.resetModules();
    const { isGeminiConfigured, isRecipeImageGenerationEnabled } =
      await import("@/lib/ai/gemini/config");
    expect(isGeminiConfigured()).toBe(true);
    expect(isRecipeImageGenerationEnabled()).toBe(true);
    vi.unstubAllEnvs();
  });
});
