import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { isAdminAny } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations";
import { mergeOfferPreferences } from "@/modules/offers/types/offer-preferences";
import type { Json } from "@/types/database";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const supabase = await createClient(request);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return apiError("Perfil não encontrado", 404);
    }

    return apiSuccess({
      ...data,
      isAdmin: isAdminAny(user.email, data.email),
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/profile");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient(request);
    const updates: {
      full_name?: string;
      body_weight_kg?: number | null;
      body_height_cm?: number | null;
      fitness_goal?: string | null;
      senior_mode_enabled?: boolean;
      offer_preferences?: Json;
    } = {};

    if (parsed.data.fullName !== undefined) {
      updates.full_name = parsed.data.fullName;
    }
    if (parsed.data.bodyWeightKg !== undefined) {
      updates.body_weight_kg = parsed.data.bodyWeightKg;
    }
    if (parsed.data.bodyHeightCm !== undefined) {
      updates.body_height_cm = parsed.data.bodyHeightCm;
    }
    if (parsed.data.fitnessGoal !== undefined) {
      updates.fitness_goal = parsed.data.fitnessGoal;
    }
    if (parsed.data.seniorModeEnabled !== undefined) {
      updates.senior_mode_enabled = parsed.data.seniorModeEnabled;
    }

    if (parsed.data.offerPreferences !== undefined) {
      const { data: currentProfile, error: readError } = await supabase
        .from("profiles")
        .select("offer_preferences")
        .eq("id", user.id)
        .single();

      if (readError) {
        throw readError;
      }

      updates.offer_preferences = mergeOfferPreferences(
        currentProfile?.offer_preferences,
        parsed.data.offerPreferences,
      ) as Json;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      return apiError("Erro ao atualizar perfil", 500);
    }

    return apiSuccess({
      ...data,
      isAdmin: isAdminAny(user.email, data.email),
    });
  } catch (error) {
    return handleApiRouteError(error, "PATCH /api/v1/profile");
  }
}
