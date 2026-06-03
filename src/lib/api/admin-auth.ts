import { apiError } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { isAdminEmail } from "@/lib/auth/admin";

export async function requireAdminUser(request?: Request) {
  const user = await requireAuthUser(request);
  if (!isAdminEmail(user.email)) {
    throw new AdminRequiredError();
  }
  return user;
}

export class AdminRequiredError extends Error {
  constructor() {
    super("ADMIN_REQUIRED");
    this.name = "AdminRequiredError";
  }
}

export function isAdminRequiredError(error: unknown): boolean {
  return error instanceof AdminRequiredError;
}

export function adminForbiddenResponse() {
  return apiError("Acesso negado — apenas administradores", 403, "FORBIDDEN");
}
