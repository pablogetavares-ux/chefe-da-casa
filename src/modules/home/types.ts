import type { UserOfferRegion } from "@/modules/offers/region/types";
import type { RegionalOffer } from "@/modules/offers/types";
import type { SmartShoppingListItem } from "@/modules/shopping/types";
import type { Recipe } from "@/types/database";

export type HomeGreeting = {
  firstName: string;
  plan: string;
  period: string;
};

export type HomeStats = {
  pantryCount: number;
  recipeCount: number;
  shoppingPendingCount: number;
  favoritesCount: number;
  aiRemaining: number;
};

export type HomeShoppingPreview = {
  listId: string;
  listName: string;
  pendingCount: number;
  items: Pick<
    SmartShoppingListItem,
    "id" | "name" | "is_checked" | "category"
  >[];
};

export type HomeFeedResponse = {
  greeting: HomeGreeting;
  stats: HomeStats;
  recipesOfTheDay: Recipe[];
  economicalRecipes: Recipe[];
  favoritesPreview: Recipe[];
  favoriteIds: string[];
  shopping: HomeShoppingPreview | null;
  nearbyOffers: RegionalOffer[];
  city: string;
  /** Região de ofertas (cidade, UF, raio) — compatível com `city` legado. */
  region?: UserOfferRegion;
};

export type HomeQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  accent: "primary" | "amber" | "emerald" | "sky" | "rose" | "violet";
};
