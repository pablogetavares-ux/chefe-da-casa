import type { SupabaseClient } from "@supabase/supabase-js";

import type { MarketPriceRow } from "@/modules/products-prices/types";
import type { Database, TablesUpdate } from "@/types/database";
import type {
  MarketPriceCreateInput,
  MarketPriceUpdateInput,
} from "@/lib/validations/products";

type Client = SupabaseClient<Database>;

export async function listPricesForProduct(client: Client, productId: string) {
  const { data, error } = await client
    .from("market_prices")
    .select("*")
    .eq("product_id", productId)
    .order("price", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MarketPriceRow[];
}

export async function createMarketPrice(
  client: Client,
  productId: string,
  input: MarketPriceCreateInput,
) {
  const { data, error } = await client
    .from("market_prices")
    .insert({
      product_id: productId,
      market_name: input.marketName.trim(),
      price: input.price,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este mercado já tem preço para este produto");
    }
    throw new Error(error.message);
  }

  return data as MarketPriceRow;
}

export async function updateMarketPrice(
  client: Client,
  id: string,
  input: MarketPriceUpdateInput,
) {
  const patch: TablesUpdate<"market_prices"> = {
    updated_at: new Date().toISOString(),
  };
  if (input.marketName !== undefined)
    patch.market_name = input.marketName.trim();
  if (input.price !== undefined) patch.price = input.price;

  const { data, error } = await client
    .from("market_prices")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as MarketPriceRow;
}

export async function deleteMarketPrice(client: Client, id: string) {
  const { error } = await client.from("market_prices").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getMarketPriceById(client: Client, id: string) {
  const { data, error } = await client
    .from("market_prices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as MarketPriceRow | null;
}
