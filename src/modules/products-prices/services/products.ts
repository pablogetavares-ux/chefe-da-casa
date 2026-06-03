import type { SupabaseClient } from "@supabase/supabase-js";

import { slugFromName } from "@/modules/products-prices/utils/slug";
import type {
  ProductRow,
  ProductWithPrices,
} from "@/modules/products-prices/types";
import type { Database, TablesUpdate } from "@/types/database";
import type {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/validations/products";

type Client = SupabaseClient<Database>;

export async function listProducts(
  client: Client,
  filters: { category?: string; q?: string; limit?: number },
) {
  let query = client
    .from("products")
    .select("*")
    .order("name", { ascending: true })
    .limit(filters.limit ?? 50);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.q) {
    query = query.ilike("name", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProductById(client: Client, id: string) {
  const { data, error } = await client
    .from("products")
    .select("*, market_prices(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProductWithPrices | null;
}

export async function createProduct(client: Client, input: ProductCreateInput) {
  const slug = input.slug ?? slugFromName(input.name);
  const { data, error } = await client
    .from("products")
    .insert({
      name: input.name.trim(),
      slug,
      category: input.category,
      base_unit: input.baseUnit,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe um produto com este slug");
    }
    throw new Error(error.message);
  }

  return data as ProductRow;
}

export async function updateProduct(
  client: Client,
  id: string,
  input: ProductUpdateInput,
) {
  const patch: TablesUpdate<"products"> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.category !== undefined) patch.category = input.category;
  if (input.baseUnit !== undefined) patch.base_unit = input.baseUnit;
  if (input.slug !== undefined) patch.slug = input.slug;

  const { data, error } = await client
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ProductRow;
}

export async function deleteProduct(client: Client, id: string) {
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
