import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchEconomyDashboard } from "@/modules/economy/services/dashboard";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const supabase = await createClient();
    const data = await fetchEconomyDashboard(supabase, user.id);

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/economy/dashboard",
      "Erro ao carregar dashboard de economia",
    );
  }
}
