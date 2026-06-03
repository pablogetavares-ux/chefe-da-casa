import type { SupabaseClient } from "@supabase/supabase-js";

import {
  aggregateMonthlySavings,
  averageRecipeCosts,
  rankMarkets,
  summarizeSavings,
  type MarketHit,
  type SavingsRow,
} from "@/lib/economy/aggregate-dashboard";
import {
  calculateRecipeCost,
  type RecipeCostIngredientInput,
} from "@/lib/recipes/calculate-recipe-cost";
import { loadProductsWithPrices } from "@/modules/recipes/services/recipe-cost";
import { roundMoney } from "@/modules/shopping/services/savings";
import type { EconomyDashboardResponse } from "@/modules/economy/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const MAX_RECIPES_FOR_COST = 10;

function parseRecipeIngredients(raw: unknown): RecipeCostIngredientInput[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const quantity =
        typeof row.quantity === "number" ? row.quantity : Number(row.quantity);
      const unit = typeof row.unit === "string" ? row.unit.trim() : "un";

      if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;

      return { name, quantity, unit };
    })
    .filter((row): row is RecipeCostIngredientInput => row !== null);
}

function savingsAt(isChecked: boolean, createdAt: string, updatedAt: string) {
  return new Date(isChecked ? updatedAt : createdAt);
}

function lineSpend(unitPrice: number | null, quantity: number | null): number {
  if (unitPrice == null || quantity == null) return 0;
  if (!Number.isFinite(unitPrice) || !Number.isFinite(quantity)) return 0;
  return roundMoney(unitPrice * quantity);
}

export async function fetchEconomyDashboard(
  client: Client,
  userId: string,
): Promise<EconomyDashboardResponse> {
  const reference = new Date();

  const { data: lists, error: listsError } = await client
    .from("shopping_lists")
    .select("id")
    .eq("user_id", userId);

  if (listsError) throw new Error(listsError.message);

  const listIds = (lists ?? []).map((row) => row.id);
  const savingsRows: SavingsRow[] = [];
  const marketHits: MarketHit[] = [];
  let pendingSavings = 0;
  let shoppingItemCount = 0;

  if (listIds.length > 0) {
    const { data: items, error: itemsError } = await client
      .from("shopping_list_items")
      .select(
        `
        estimated_savings,
        is_checked,
        created_at,
        updated_at,
        unit_price,
        quantity,
        offer_id,
        regional_offers (
          regional_stores (
            chain,
            name
          )
        )
      `,
      )
      .in("shopping_list_id", listIds);

    if (itemsError) throw new Error(itemsError.message);

    for (const item of items ?? []) {
      shoppingItemCount += 1;
      const savings = Number(item.estimated_savings ?? 0);
      const at = savingsAt(item.is_checked, item.created_at, item.updated_at);
      const spend = lineSpend(
        item.unit_price != null ? Number(item.unit_price) : null,
        item.quantity != null ? Number(item.quantity) : null,
      );

      if (savings > 0) {
        savingsRows.push({ savings, at, spend });
      } else if (spend > 0) {
        savingsRows.push({ savings: 0, at, spend });
      }

      if (!item.is_checked && savings > 0) {
        pendingSavings += savings;
      }

      const store = item.regional_offers?.regional_stores;
      if (store) {
        marketHits.push({
          name: store.chain?.trim() || store.name?.trim() || "Mercado",
        });
      }
    }
  }

  const { data: weeklyPlans, error: plansError } = await client
    .from("weekly_meal_plans")
    .select("cheapest_market, total_cost, created_at, plan_json")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);

  if (plansError) throw new Error(plansError.message);

  for (const plan of weeklyPlans ?? []) {
    if (plan.cheapest_market) {
      marketHits.push({ name: plan.cheapest_market });
    }

    const at = new Date(plan.created_at);
    const json = plan.plan_json as Record<string, unknown> | null;
    const weeklyCost =
      json && typeof json.weeklyCost === "object"
        ? (json.weeklyCost as Record<string, unknown>)
        : null;

    const cheapest = Number(weeklyCost?.totalCheapest ?? plan.total_cost ?? 0);
    const expensive = Number(weeklyCost?.totalMostExpensive ?? 0);
    const planSavings =
      expensive > cheapest ? roundMoney(expensive - cheapest) : 0;

    if (planSavings > 0) {
      savingsRows.push({ savings: planSavings, at });
    }

    if (cheapest > 0) {
      savingsRows.push({ savings: 0, at, spend: cheapest });
    }
  }

  const { data: recipes, error: recipesError } = await client
    .from("recipes")
    .select("id, servings, ingredients, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_RECIPES_FOR_COST);

  if (recipesError) throw new Error(recipesError.message);

  const products = await loadProductsWithPrices(client);
  const recipeTotals: number[] = [];
  const recipeServings: number[] = [];

  for (const recipe of recipes ?? []) {
    const ingredients = parseRecipeIngredients(recipe.ingredients);
    if (ingredients.length === 0) continue;

    const result = calculateRecipeCost(ingredients, products);
    const cheapest = result.summary.cheapestTotal;
    if (cheapest <= 0) continue;

    recipeTotals.push(cheapest);
    recipeServings.push(recipe.servings ?? 4);

    const at = new Date(recipe.created_at);
    savingsRows.push({ savings: 0, at, spend: cheapest });
  }

  const savingsSummary = summarizeSavings(savingsRows, reference);
  const { avgRecipeCost, avgCostPerServing } = averageRecipeCosts(
    recipeTotals,
    recipeServings,
  );

  const monthly = aggregateMonthlySavings(savingsRows, reference);
  const topMarkets = rankMarkets(marketHits);

  const hasActivity =
    shoppingItemCount > 0 ||
    (weeklyPlans?.length ?? 0) > 0 ||
    recipeTotals.length > 0;

  return {
    summary: {
      ...savingsSummary,
      avgRecipeCost,
      avgCostPerServing,
      recipesAnalyzed: recipeTotals.length,
      pendingSavings: roundMoney(pendingSavings),
      weeklyPlansCount: weeklyPlans?.length ?? 0,
    },
    monthly,
    topMarkets,
    hasActivity,
    generatedAt: reference.toISOString(),
  };
}
