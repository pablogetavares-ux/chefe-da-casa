import type { SupabaseClient } from "@supabase/supabase-js";

import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import type { UserOfferRegion } from "@/modules/offers/region/types";
import { queryRegionalOffersWithMeta } from "@/modules/offers/services/offers";
import { getUserOfferRegion } from "@/modules/offers/services/region";
import {
  fetchUserOfferContext,
  type UserOfferContext,
} from "@/modules/offers/services/user-offer-context";
import type {
  OfferMatchScope,
  PantryGapItem,
  PantryOffersResponse,
  RegionalOffer,
} from "@/modules/offers/types";
import {
  extractRecipeIngredientNames,
  normalizeOfferText,
  scoreOfferForRecipe,
  termsForIngredientName,
  termsMatch,
} from "@/modules/offers/utils/matching";
import { applyUserOfferPrioritization } from "@/modules/offers/utils/prioritization";
import {
  fetchShoppingListItems,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";
import { fetchAntiWasteSummary } from "@/lib/ai/services/anti-waste";
import type {
  IngredientOffersContext,
  IngredientOffersResponse,
} from "@/modules/offers/types";
import type { Database, Recipe } from "@/types/database";

type Client = SupabaseClient<Database>;

export type OffersIntegrationBundle = {
  userContext: UserOfferContext;
  region: UserOfferRegion;
  extensions: { slug: string; name: string; status: string }[];
};

function ingredientInPantry(
  ingredientName: string,
  pantryNames: string[],
): boolean {
  return pantryNames.some((pantryName) =>
    termsMatch(ingredientName, pantryName),
  );
}

export async function collectPantryGaps(
  supabase: Client,
  userId: string,
): Promise<PantryGapItem[]> {
  const [pantryResult, recipeResult] = await Promise.all([
    supabase.from("pantry_items").select("name").eq("user_id", userId),
    supabase
      .from("recipes")
      .select("id, title, ingredients, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);

  if (pantryResult.error) throw pantryResult.error;
  if (recipeResult.error) throw recipeResult.error;

  const pantryRows = pantryResult.data;
  const recipeRows = recipeResult.data;

  const pantryNames = (pantryRows ?? []).map((row) => row.name);
  const gaps: PantryGapItem[] = [];
  const seen = new Set<string>();

  for (const recipe of (recipeRows ?? []) as Recipe[]) {
    for (const name of extractRecipeIngredientNames(recipe)) {
      const key = normalizeOfferText(name);
      if (!key || seen.has(key) || ingredientInPantry(name, pantryNames))
        continue;
      seen.add(key);
      gaps.push({
        ingredientName: name,
        source: "recipe",
        sourceLabel: recipe.title,
      });
    }
  }

  try {
    const list = await resolveShoppingList(supabase, userId);
    const items = await fetchShoppingListItems(supabase, list.id);
    for (const item of items.filter((row) => !row.is_checked)) {
      const key = normalizeOfferText(item.name);
      if (!key || seen.has(key) || ingredientInPantry(item.name, pantryNames)) {
        continue;
      }
      seen.add(key);
      gaps.push({
        ingredientName: item.name,
        source: "shopping_list",
        sourceLabel: "Lista de compras",
      });
    }
  } catch (error) {
    const { logger } = await import("@/lib/observability/logger");
    logger.warn("offers.integrations.shopping_list_optional_failed", {
      userId,
      error: error instanceof Error ? error.message : "unknown",
    });
  }

  return gaps.slice(0, 16);
}

function enrichGapOffers(
  offers: RegionalOffer[],
  gapNames: string[],
): RegionalOffer[] {
  return offers.map((offer) => ({
    ...offer,
    matchedIngredients: gapNames.filter(
      (name) => scoreOfferForRecipe(offer, termsForIngredientName(name)) > 0,
    ),
    matchScore: gapNames.reduce(
      (max, name) =>
        Math.max(max, scoreOfferForRecipe(offer, termsForIngredientName(name))),
      0,
    ),
  }));
}

function summarizeUserContext(
  userContext: UserOfferContext,
): PantryOffersResponse["userContext"] {
  return {
    plan: userContext.plan,
    fitnessGoal: userContext.fitnessGoal,
    seniorMode: userContext.seniorMode,
    offerPreferences: userContext.offerPreferences,
    priorityCategories: userContext.priorityCategories,
    priorityLabels: userContext.priorityLabels,
    personalizationReason: userContext.personalizationReason,
  };
}

export async function queryOffersForIngredientNames(
  supabase: Client,
  userId: string,
  ingredientNames: string[],
  options?: {
    region?: UserOfferRegion;
    context?: IngredientOffersContext;
    limit?: number;
  },
): Promise<IngredientOffersResponse> {
  const [userContext, profileRegion] = await Promise.all([
    fetchUserOfferContext(supabase, userId),
    getUserOfferRegion(supabase, userId),
  ]);

  const region = buildUserOfferRegion({
    city: options?.region?.city ?? profileRegion.city,
    state: options?.region?.state ?? profileRegion.state,
    radiusKm: options?.region?.radiusKm ?? profileRegion.radiusKm,
  });

  const uniqueNames = [
    ...new Set(
      ingredientNames
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    ),
  ].slice(0, 32);

  if (uniqueNames.length === 0) {
    return {
      ingredientNames: [],
      offers: [],
      hasMatches: false,
      matchScope: "none",
      city: region.city,
      state: region.state,
      radiusKm: region.radiusKm,
      userContext: summarizeUserContext(userContext),
      context: options?.context ?? "ingredients",
    };
  }

  const terms = uniqueNames.flatMap((name) => termsForIngredientName(name));

  const { offers: rawOffers } = await queryRegionalOffersWithMeta(supabase, {
    userId,
    region,
    scope: "within_radius",
    limit: 72,
  });

  const scored = rawOffers
    .map((offer) => ({
      offer,
      score: scoreOfferForRecipe(offer, terms),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.offer.discountPercent ?? 0) - (a.offer.discountPercent ?? 0),
    );

  const matchScope: OfferMatchScope =
    scored.length > 0 ? "local" : rawOffers.length > 0 ? "cross_city" : "none";

  const matched = applyUserOfferPrioritization(
    enrichGapOffers(
      scored.map((entry) => entry.offer),
      uniqueNames,
    ),
    userContext,
  ).slice(0, options?.limit ?? 6);

  return {
    ingredientNames: uniqueNames,
    offers: matched,
    hasMatches: matched.length > 0,
    matchScope,
    city: region.city,
    state: region.state,
    radiusKm: region.radiusKm,
    userContext: summarizeUserContext(userContext),
    context: options?.context ?? "ingredients",
  };
}

export async function queryOffersForPantryGaps(
  supabase: Client,
  userId: string,
  options?: { region?: UserOfferRegion },
): Promise<PantryOffersResponse> {
  const gaps = await collectPantryGaps(supabase, userId);
  const ingredientResult = await queryOffersForIngredientNames(
    supabase,
    userId,
    gaps.map((gap) => gap.ingredientName),
    { region: options?.region, context: "pantry" },
  );

  return {
    gaps,
    offers: ingredientResult.offers,
    hasMatches: ingredientResult.hasMatches,
    matchScope: ingredientResult.matchScope,
    city: ingredientResult.city,
    state: ingredientResult.state,
    radiusKm: ingredientResult.radiusKm,
    userContext: ingredientResult.userContext,
  };
}

export async function queryOffersForAntiWaste(
  supabase: Client,
  userId: string,
  options?: { region?: UserOfferRegion },
): Promise<IngredientOffersResponse> {
  const summary = await fetchAntiWasteSummary(supabase, userId);
  const names = [
    ...summary.expired,
    ...summary.expiringSoon,
    ...summary.leftovers,
  ].map((item) => item.name);

  return queryOffersForIngredientNames(supabase, userId, names, {
    region: options?.region,
    context: "anti_waste",
  });
}

export async function fetchOffersIntegrationBundle(
  supabase: Client,
  userId: string,
): Promise<OffersIntegrationBundle> {
  const [userContext, profileRegion, extensionsResult] = await Promise.all([
    fetchUserOfferContext(supabase, userId),
    getUserOfferRegion(supabase, userId),
    supabase
      .from("offer_extension_registry")
      .select("slug, name, status")
      .order("created_at", { ascending: true }),
  ]);

  const region = buildUserOfferRegion(profileRegion);

  if (extensionsResult.error) {
    const { logger } = await import("@/lib/observability/logger");
    logger.error("offers.integrations.extensions_failed", {
      userId,
      error: extensionsResult.error.message,
    });
    throw extensionsResult.error;
  }

  return {
    userContext,
    region,
    extensions: extensionsResult.data ?? [],
  };
}

export function prioritizeMatchedOffers(
  offers: RegionalOffer[],
  userContext: UserOfferContext,
): RegionalOffer[] {
  return applyUserOfferPrioritization(offers, userContext);
}
