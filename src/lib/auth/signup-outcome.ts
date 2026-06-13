import type { AuthError, User } from "@supabase/supabase-js";

export const EXISTING_ACCOUNT_SIGNUP_MESSAGE =
  "Este e-mail já tem conta. Use Entrar com sua senha.";

export const EXISTING_ACCOUNT_SIGNUP_CODE = "existing_account" as const;

const EXISTING_ACCOUNT_ERROR_CODES = new Set([
  "user_already_exists",
  "email_exists",
  "user_already_registered",
]);

type SignupData = {
  user: User | null;
  session: unknown;
};

export type SignupOutcome =
  | { kind: "existing_account" }
  | { kind: "new_with_session" }
  | { kind: "new_pending_confirmation" }
  | { kind: "provider_error"; message: string; code?: string };

function isExistingAccountFromUser(user: User | null | undefined): boolean {
  if (!user) return true;
  return user.identities == null || user.identities.length === 0;
}

export function isExistingAccountSignupError(
  message: string,
  code?: string,
): boolean {
  if (code && EXISTING_ACCOUNT_ERROR_CODES.has(code)) {
    return true;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("user already") ||
    normalized.includes("email address has already been registered")
  );
}

export function classifySignupOutcome(params: {
  data: SignupData;
  error: AuthError | null;
}): SignupOutcome {
  const { data, error } = params;

  if (error) {
    if (isExistingAccountSignupError(error.message, error.code)) {
      return { kind: "existing_account" };
    }
    return {
      kind: "provider_error",
      message: error.message,
      code: error.code,
    };
  }

  if (isExistingAccountFromUser(data.user)) {
    return { kind: "existing_account" };
  }

  if (data.session) {
    return { kind: "new_with_session" };
  }

  return { kind: "new_pending_confirmation" };
}
