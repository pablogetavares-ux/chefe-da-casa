import { describe, expect, it } from "vitest";

import {
  EXISTING_ACCOUNT_SIGNUP_MESSAGE,
  classifySignupOutcome,
  isExistingAccountSignupError,
} from "./signup-outcome";

describe("signup-outcome", () => {
  it("detects existing account from Supabase identities=[] pattern", () => {
    expect(
      classifySignupOutcome({
        data: {
          user: { id: "1", identities: [] } as never,
          session: null,
        },
        error: null,
      }),
    ).toEqual({ kind: "existing_account" });
  });

  it("detects existing account from provider error code", () => {
    expect(
      classifySignupOutcome({
        data: { user: null, session: null },
        error: {
          message: "User already registered",
          code: "user_already_exists",
        } as never,
      }),
    ).toEqual({ kind: "existing_account" });
  });

  it("allows new account with immediate session", () => {
    expect(
      classifySignupOutcome({
        data: {
          user: {
            id: "2",
            identities: [{ provider: "email" }],
          } as never,
          session: { access_token: "token" },
        },
        error: null,
      }),
    ).toEqual({ kind: "new_with_session" });
  });

  it("allows new account pending email confirmation", () => {
    expect(
      classifySignupOutcome({
        data: {
          user: {
            id: "3",
            identities: [{ provider: "email" }],
          } as never,
          session: null,
        },
        error: null,
      }),
    ).toEqual({ kind: "new_pending_confirmation" });
  });

  it("maps unrelated provider errors", () => {
    expect(
      classifySignupOutcome({
        data: { user: null, session: null },
        error: { message: "Weak password", code: "weak_password" } as never,
      }),
    ).toEqual({
      kind: "provider_error",
      message: "Weak password",
      code: "weak_password",
    });
  });

  it("uses stable copy for existing account message", () => {
    expect(EXISTING_ACCOUNT_SIGNUP_MESSAGE).toContain("Entrar");
    expect(
      isExistingAccountSignupError(
        "A user with this email address has already been registered",
      ),
    ).toBe(true);
  });
});
