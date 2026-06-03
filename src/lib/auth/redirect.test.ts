import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "@/lib/auth/redirect";

describe("getSafeRedirectPath", () => {
  it("retorna /app para assets e rotas de sistema", () => {
    expect(getSafeRedirectPath("/apple-icon")).toBe("/app");
    expect(getSafeRedirectPath("/icon")).toBe("/app");
    expect(getSafeRedirectPath("/manifest.webmanifest")).toBe("/app");
    expect(getSafeRedirectPath("/opengraph-image")).toBe("/app");
    expect(getSafeRedirectPath("/api/health")).toBe("/app");
  });

  it("permite rotas internas válidas", () => {
    expect(getSafeRedirectPath("/app/pantry")).toBe("/app/pantry");
    expect(getSafeRedirectPath("/pricing")).toBe("/pricing");
  });

  it("bloqueia open redirect", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/app");
    expect(getSafeRedirectPath(null)).toBe("/app");
  });
});
