import { describe, expect, it } from "vitest";

import {
  getPlanLimits,
  isAiUsageExceeded,
  isPantryLimitExceeded,
  isUnlimited,
  planKeyFromTier,
} from "@/lib/billing/plan-limits-core";

describe("plan-limits-core", () => {
  it("normaliza tier desconhecido para free", () => {
    expect(planKeyFromTier("UNKNOWN")).toBe("free");
    expect(planKeyFromTier("PRO")).toBe("pro");
  });

  it("detecta limites ilimitados", () => {
    expect(isUnlimited(-1)).toBe(true);
    expect(isUnlimited(10)).toBe(false);
  });

  it("aplica limites do plano free", () => {
    const limits = getPlanLimits("free");
    expect(limits.aiGenerationsPerMonth).toBe(10);
    expect(limits.pantryItems).toBe(20);
  });

  it("bloqueia IA quando uso atinge o limite", () => {
    expect(isAiUsageExceeded(9, "free")).toBe(false);
    expect(isAiUsageExceeded(10, "free")).toBe(true);
  });

  it("respeita despensa ilimitada no plano family", () => {
    expect(isPantryLimitExceeded(999, 1, "family")).toBe(false);
  });

  it("bloqueia despensa quando excede limite free", () => {
    expect(isPantryLimitExceeded(19, 1, "free")).toBe(false);
    expect(isPantryLimitExceeded(20, 1, "free")).toBe(true);
  });
});
