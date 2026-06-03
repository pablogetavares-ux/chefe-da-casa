import { getAuthUser } from "@/lib/api/auth";
import { isAdminAny } from "@/lib/auth/admin";

/** Detalhes de health/status completos: dev sempre; prod só admin autenticado. */
export async function canAccessDetailedOps(
  request?: Request,
): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;

  const user = await getAuthUser(request);
  if (!user) return false;

  return isAdminAny(user.email);
}
