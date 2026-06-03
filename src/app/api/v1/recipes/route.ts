import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { RECIPE_LIST_SELECT } from "@/lib/recipes/list-select";
import { createClient } from "@/lib/supabase/server";
import { recipesListQuerySchema } from "@/lib/validations/recipes-list";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const query = recipesListQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;

    const { data, error, count } = await supabase
      .from("recipes")
      .select(RECIPE_LIST_SELECT, { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const total = count ?? 0;

    return apiSuccess({
      items: data ?? [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasMore: from + (data?.length ?? 0) < total,
      },
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/recipes");
  }
}
