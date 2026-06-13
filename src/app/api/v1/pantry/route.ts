import { throwIfSupabaseError } from "@/lib/api/supabase-errors";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  handleApiRouteError,
  handleApiRouteErrorWithPlanLimit,
} from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { assertPantryLimit } from "@/lib/billing/plan-limits";
import { createClient } from "@/lib/supabase/server";
import { pantryItemSchema } from "@/lib/validations";

function toExpiresAt(value?: string | null) {
  if (!value) return null;
  if (value.includes("T")) return value;
  return `${value}T23:59:59.000Z`;
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    throwIfSupabaseError(error);
    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/pantry");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = pantryItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    await assertPantryLimit(user.id);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        quantity: parsed.data.quantity ?? null,
        unit: parsed.data.unit ?? null,
        category: parsed.data.category ?? null,
        expires_at: toExpiresAt(parsed.data.expiresAt),
        item_kind: parsed.data.itemKind ?? "stock",
        notes: parsed.data.notes?.trim() || null,
      })
      .select()
      .single();

    throwIfSupabaseError(error);
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(error, "POST /api/v1/pantry");
  }
}
