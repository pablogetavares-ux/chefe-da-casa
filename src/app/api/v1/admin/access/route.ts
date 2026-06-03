import { requireAuthUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { isAdminAny } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = isAdminAny(user.email, profile?.email);

    return apiSuccess({ isAdmin });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/admin/access");
  }
}
