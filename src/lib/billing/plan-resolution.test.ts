import { describe, expect, it } from "vitest";

import { resolveEffectiveProfilePlan } from "@/lib/billing/premium";

describe("resolveEffectiveProfilePlan", () => {
  it("mantém PRO mobile quando Stripe está FREE", () => {
    expect(resolveEffectiveProfilePlan("FREE", "PRO")).toBe("PRO");
  });

  it("mantém FAMILY quando Stripe é PRO e mobile FREE", () => {
    expect(resolveEffectiveProfilePlan("PRO", "FREE")).toBe("PRO");
    expect(resolveEffectiveProfilePlan("FAMILY", "PRO")).toBe("FAMILY");
  });

  it("retorna FREE quando ambos canais estão inativos", () => {
    expect(resolveEffectiveProfilePlan("FREE", "FREE")).toBe("FREE");
  });
});
