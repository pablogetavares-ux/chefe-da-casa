import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { homeFeedQuerySchema } from "@/lib/validations";
import { fetchHomeFeed } from "@/modules/home/services/home-feed";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = homeFeedQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await fetchHomeFeed(supabase, user.id, {
      city: parsed.data.city,
      state: parsed.data.state,
      radiusKm: parsed.data.radiusKm,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/home");
  }
}
