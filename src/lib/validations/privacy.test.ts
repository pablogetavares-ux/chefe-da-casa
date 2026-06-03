import { describe, expect, it } from "vitest";

import { deleteAccountSchema } from "@/lib/validations";

describe("deleteAccountSchema", () => {
  it("aceita e-mail válido", () => {
    const result = deleteAccountSchema.safeParse({
      confirmEmail: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = deleteAccountSchema.safeParse({
      confirmEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
