import type { SupabaseClient } from "@supabase/supabase-js";

import { logPrivacyEvent } from "@/lib/privacy/audit";
import type { Database } from "@/types/database";

export type UserDataExport = {
  exportedAt: string;
  userId: string;
  profile: unknown;
  recipes: unknown[];
  pantryItems: unknown[];
  favorites: unknown[];
  shoppingLists: unknown[];
  usageLogs: unknown[];
  aiGenerations: unknown[];
  ingredientScans: unknown[];
  subscriptions: unknown[];
};

export async function exportUserData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserDataExport> {
  const [
    profileRes,
    recipesRes,
    pantryRes,
    favoritesRes,
    shoppingRes,
    usageRes,
    aiRes,
    scansRes,
    subsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("recipes").select("*").eq("user_id", userId),
    supabase.from("pantry_items").select("*").eq("user_id", userId),
    supabase
      .from("favorites")
      .select("*, recipe:recipes(*)")
      .eq("user_id", userId),
    supabase
      .from("shopping_lists")
      .select("*, items:shopping_list_items(*)")
      .eq("user_id", userId),
    supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("ai_generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("ingredient_scans")
      .select("id, detected_ingredients, scene_description, created_at")
      .eq("user_id", userId),
    supabase.from("subscriptions").select("*").eq("user_id", userId),
  ]);

  const payload: UserDataExport = {
    exportedAt: new Date().toISOString(),
    userId,
    profile: profileRes.data,
    recipes: recipesRes.data ?? [],
    pantryItems: pantryRes.data ?? [],
    favorites: favoritesRes.data ?? [],
    shoppingLists: shoppingRes.data ?? [],
    usageLogs: usageRes.data ?? [],
    aiGenerations: aiRes.data ?? [],
    ingredientScans: scansRes.data ?? [],
    subscriptions: subsRes.data ?? [],
  };

  await logPrivacyEvent(userId, "data_export", {
    recipes: payload.recipes.length,
    pantry_items: payload.pantryItems.length,
  });

  return payload;
}
