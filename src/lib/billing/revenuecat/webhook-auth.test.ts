import { describe, expect, it } from "vitest";

import { verifyRevenueCatAuthorization } from "@/lib/billing/revenuecat/webhook-auth";

describe("verifyRevenueCatAuthorization", () => {
  it("aceita bearer válido", () => {
    expect(
      verifyRevenueCatAuthorization("Bearer secret-token", "secret-token"),
    ).toBe(true);
  });

  it("rejeita token inválido", () => {
    expect(verifyRevenueCatAuthorization("Bearer wrong", "secret-token")).toBe(
      false,
    );
  });
});
