import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser(request);
    const { id: rawId } = await params;
    const parsed = z.string().uuid().safeParse(rawId);

    if (!parsed.success) {
      return apiError("Receita inválida", 400, "VALIDATION_ERROR");
    }

    const supabase = await createClient(request);

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", parsed.data)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return apiSuccess({ id: parsed.data });
  } catch (error) {
    return handleApiRouteError(error, "DELETE /api/v1/recipes/[id]");
  }
}
