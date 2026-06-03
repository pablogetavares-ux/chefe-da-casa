import type { SupabaseClient } from "@supabase/supabase-js";

import type { SubstitutionRuleRow } from "@/lib/substitutions/suggest-cheaper";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function loadSubstitutionRules(
  client: Client,
): Promise<SubstitutionRuleRow[]> {
  const { data, error } = await client
    .from("ingredient_substitutions")
    .select(
      "id, original_name, substitute_name, reason, original_product_id, substitute_product_id",
    )
    .eq("is_active", true)
    .order("original_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    original_name: row.original_name,
    substitute_name: row.substitute_name,
    reason: row.reason,
    original_product_id: row.original_product_id,
    substitute_product_id: row.substitute_product_id,
  }));
}
