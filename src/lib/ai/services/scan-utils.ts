import type { SupabaseClient } from "@supabase/supabase-js";

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
