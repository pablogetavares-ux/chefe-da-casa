import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerFavoriteSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("offer_favorites")
      .select("offer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return apiError(error.message, 500);
    }

    return apiSuccess({
      offerIds: (data ?? []).map((row) => row.offer_id),
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/offers/favorites");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = offerFavoriteSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();

    const { data: offer } = await supabase
      .from("regional_offers")
      .select("id")
      .eq("id", parsed.data.offerId)
      .single();

    if (!offer) {
      return apiError("Oferta não encontrada", 404);
    }

    const { data, error } = await supabase
      .from("offer_favorites")
      .insert({
        user_id: user.id,
        offer_id: parsed.data.offerId,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return apiError("Oferta já está nos favoritos", 409);
      }
      return apiError(error.message, 500);
    }

    return apiSuccess({ id: data.id, offerId: parsed.data.offerId }, 201);
  } catch (error) {
    return handleApiRouteError(error, "POST /api/v1/offers/favorites");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthUser();
    const offerId = new URL(request.url).searchParams.get("offerId");

    if (!offerId) {
      return apiError("offerId é obrigatório", 400);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("offer_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("offer_id", offerId);

    if (error) {
      return apiError(error.message, 500);
    }

    return apiSuccess({ offerId });
  } catch (error) {
    return handleApiRouteError(error, "DELETE /api/v1/offers/favorites");
  }
}
