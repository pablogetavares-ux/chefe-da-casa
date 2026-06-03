import { apiError } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { isAdminAny } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function assertAdminApiAccess() {
  const user = await requireAuthUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  if (!isAdminAny(user.email, profile?.email)) {
    return {
      ok: false as const,
      user: null,
      response: apiError("Acesso negado", 403, "FORBIDDEN"),
    };
  }
  return { ok: true as const, user, response: null };
}

export function adminUnauthorizedResponse() {
  return apiError("Não autenticado", 401, "UNAUTHORIZED");
}
