import { parseUuidParam } from "@/lib/api/route-params";
import { throwIfSupabaseError } from "@/lib/api/supabase-errors";
import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { pantryItemUpdateSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

function toExpiresAt(value?: string | null) {
  if (!value) return null;
  if (value.includes("T")) return value;
  return `${value}T23:59:59.000Z`;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id: rawId } = await params;
    const idParsed = parseUuidParam(rawId, "Item");
    if (!idParsed.ok) {
      return apiError(idParsed.message, 400, "VALIDATION_ERROR");
    }
    const id = idParsed.id;
    const body = await request.json();
    const parsed = pantryItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const updates: {
      name?: string;
      quantity?: number | null;
      unit?: string | null;
      category?: string | null;
      expires_at?: string | null;
      item_kind?: string;
      notes?: string | null;
    } = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.quantity !== undefined) {
      updates.quantity = parsed.data.quantity ?? null;
    }
    if (parsed.data.unit !== undefined) updates.unit = parsed.data.unit ?? null;
    if (parsed.data.category !== undefined) {
      updates.category = parsed.data.category ?? null;
    }
    if (parsed.data.expiresAt !== undefined) {
      updates.expires_at = toExpiresAt(parsed.data.expiresAt);
    }
    if (parsed.data.itemKind !== undefined) {
      updates.item_kind = parsed.data.itemKind;
    }
    if (parsed.data.notes !== undefined) {
      updates.notes = parsed.data.notes?.trim() || null;
    }

    const { data, error } = await supabase
      .from("pantry_items")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return apiError("Item não encontrado", 404);
    }

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(error, "PATCH /api/v1/pantry/[id]");
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id: rawId } = await params;
    const idParsed = parseUuidParam(rawId, "Item");
    if (!idParsed.ok) {
      return apiError(idParsed.message, 400, "VALIDATION_ERROR");
    }
    const id = idParsed.id;
    const supabase = await createClient();

    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    throwIfSupabaseError(error);

    return apiSuccess({ id });
  } catch (error) {
    return handleApiRouteError(error, "DELETE /api/v1/pantry/[id]");
  }
}
