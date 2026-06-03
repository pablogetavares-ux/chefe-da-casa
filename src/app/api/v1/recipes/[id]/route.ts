import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return apiError(error.message, 500);
    }

    return apiSuccess({ id });
  } catch (error) {
    return handleApiRouteError(error, "DELETE /api/v1/recipes/[id]");
  }
}
