import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ProductPriceComparison,
  ProductsCompareResponse,
} from "@/modules/products-prices/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function buildProductsPriceComparison(
  client: Client,
  filters: { category?: string; q?: string },
): Promise<ProductsCompareResponse> {
  let query = client
    .from("products")
    .select("*, market_prices(*)")
    .order("name", { ascending: true });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.q) {
    query = query.ilike("name", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const products = data ?? [];
  const marketSet = new Set<string>();

  const comparisons: ProductPriceComparison[] = products.map((row) => {
    const prices = [...(row.market_prices ?? [])].sort(
      (a, b) => Number(a.price) - Number(b.price),
    );
    prices.forEach((p) => marketSet.add(p.market_name));

    const cheapest = prices[0] ?? null;
    const mostExpensive = prices[prices.length - 1] ?? null;
    const min = cheapest ? Number(cheapest.price) : 0;
    const max = mostExpensive ? Number(mostExpensive.price) : 0;

    return {
      product: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        base_unit: row.base_unit,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      prices,
      cheapest,
      mostExpensive,
      priceSpread: prices.length > 0 ? Math.round((max - min) * 100) / 100 : 0,
      marketCount: prices.length,
    };
  });

  return {
    comparisons: comparisons.filter((c) => c.marketCount > 0),
    markets: [...marketSet].sort((a, b) => a.localeCompare(b, "pt-BR")),
    totalProducts: comparisons.length,
  };
}
