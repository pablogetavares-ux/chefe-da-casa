import type { SupabaseClient } from "@supabase/supabase-js";

import type { ScanResult } from "@/lib/ai/schemas/scan-output";
import { assertPantryLimit } from "@/lib/billing/plan-limits";
import { assertFoodScanPath } from "@/lib/security/storage-path";
import { getFoodScanSignedUrl, toDataUrl } from "@/lib/storage/food-scans";
import type { Database } from "@/types/database";

type ScanImageInput = {
  storagePath?: string;
  imageBase64?: string;
  mimeType?: string;
};

export async function resolveScanImageUrl(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: ScanImageInput,
): Promise<{ imageUrl: string; storagePath?: string }> {
  if (input.storagePath) {
    assertFoodScanPath(input.storagePath, userId);

    const imageUrl = await getFoodScanSignedUrl(supabase, input.storagePath);
    return { imageUrl, storagePath: input.storagePath };
  }

  if (input.imageBase64) {
    const mimeType = input.mimeType ?? "image/jpeg";
    return { imageUrl: toDataUrl(input.imageBase64, mimeType) };
  }

  throw new Error("INVALID_IMAGE_TYPE");
}

const SCAN_REUSE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Reutiliza scan recente da mesma imagem para evitar chamada vision duplicada. */
export async function loadRecentScanByStoragePath(
  supabase: SupabaseClient<Database>,
  userId: string,
  storagePath: string,
): Promise<ScanResult | null> {
  const cutoff = new Date(Date.now() - SCAN_REUSE_MAX_AGE_MS).toISOString();

  const { data, error } = await supabase
    .from("ingredient_scans")
    .select("detected_ingredients, scene_description")
    .eq("user_id", userId)
    .eq("storage_path", storagePath)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.detected_ingredients) return null;

  const ingredients = data.detected_ingredients as ScanResult["ingredients"];
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null;

  return {
    ingredients,
    sceneDescription: data.scene_description ?? "",
    suggestions: [],
  };
}

export async function addDetectedIngredientsToPantry(
  supabase: SupabaseClient<Database>,
  userId: string,
  names: string[],
) {
  if (names.length === 0) return 0;

  const { data: existing } = await supabase
    .from("pantry_items")
    .select("name")
    .eq("user_id", userId);

  const existingNames = new Set(
    existing?.map((item) => item.name.toLowerCase()) ?? [],
  );

  const toInsert = names
    .filter((name) => !existingNames.has(name.toLowerCase()))
    .map((name) => ({ user_id: userId, name }));

  if (toInsert.length === 0) return 0;

  await assertPantryLimit(userId, toInsert.length);

  const { error } = await supabase.from("pantry_items").insert(toInsert);
  if (error) {
    throw new Error(error.message);
  }

  return toInsert.length;
}
