import type { OfferRegionScope } from "@/modules/offers/region/types";
import type { Enums, Tables } from "@/types/database";

export type OfferCategory = Enums<"OfferCategory">;
export type RegionalOfferRow = Tables<"regional_offers">;
export type RegionalStoreRow = Tables<"regional_stores">;

export type OfferMatchScope = "local" | "cross_city" | "none";

export type {
  OfferRegionScope,
  UserOfferRegion,
} from "@/modules/offers/region/types";

export type RegionalOffer = RegionalOfferRow & {
  store: RegionalStoreRow;
  isFavorite?: boolean;
  discountPercent?: number | null;
  matchScore?: number;
  isSuggested?: boolean;
  isCrossCity?: boolean;
  matchedIngredients?: string[];
  /** Distância do centro da região do usuário ao mercado (km). */
  distanceKm?: number | null;
  /** Classificação regional da oferta em relação à região do usuário. */
  regionScope?: OfferRegionScope | null;
};

export type OfferAlternateCity = {
  city: string;
  matchCount: number;
};

export type OffersListResponse = {
  offers: RegionalOffer[];
  cities: string[];
  /** Cidades com UF — preferir para novos filtros regionais. */
  regionCities: { city: string; state: string; label: string }[];
  categories: OfferCategory[];
  favoriteIds: string[];
  region: import("@/modules/offers/region/types").UserOfferRegion;
  filters: {
    city: string | null;
    state: string | null;
    radiusKm: number;
    scope: OfferRegionScope;
    category: OfferCategory | null;
    q: string | null;
  };
};

export type OffersForRecipeResponse = {
  recipeId: string;
  recipeTitle: string;
  offers: RegionalOffer[];
  hasIngredientMatches: boolean;
  matchScope: OfferMatchScope;
  city: string;
  state: string;
  radiusKm: number;
  regionScope: OfferRegionScope;
  cities: string[];
  regionCities: { city: string; state: string; label: string }[];
  ingredientNames: string[];
  alternateCities: OfferAlternateCity[];
};

export function describeRecipeOffersScope(response: {
  matchScope: OfferMatchScope;
  city: string;
  ingredientNames: string[];
  alternateCities: OfferAlternateCity[];
}): string {
  const ingredients =
    response.ingredientNames.length > 0
      ? response.ingredientNames.slice(0, 3).join(", ")
      : "seus ingredientes";

  switch (response.matchScope) {
    case "local":
      return `Promoções em ${response.city} que combinam com ${ingredients}.`;
    case "cross_city": {
      const topCity = response.alternateCities[0]?.city;
      if (topCity) {
        return `Sem promoções de ${ingredients} em ${response.city}. Encontramos ofertas em ${topCity} e outras cidades.`;
      }
      return `Sem promoções locais — ofertas relacionadas em outras cidades.`;
    }
    default: {
      if (response.alternateCities.length > 0) {
        const cities = response.alternateCities
          .slice(0, 2)
          .map((item) => item.city)
          .join(" e ");
        return `Nenhuma promoção ativa para ${ingredients} em ${response.city}. Tente ${cities}.`;
      }
      return `Nenhuma promoção ativa para ${ingredients} em ${response.city} no momento.`;
    }
  }
}

export const OFFER_CATEGORY_LABELS: Record<OfferCategory, string> = {
  MEAT: "Carnes e peixes",
  PRODUCE: "Frutas e verduras",
  DAIRY: "Laticínios",
  BAKERY: "Padaria",
  BEVERAGES: "Bebidas",
  FROZEN: "Congelados",
  PANTRY: "Mercearia",
  CLEANING: "Limpeza",
  OTHER: "Outros",
};

export const DEFAULT_OFFER_CITY = "Belo Horizonte";

export const DEFAULT_OFFER_STATE = "MG";

export function formatOfferPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function computeDiscountPercent(
  current: number,
  previous: number | null,
): number | null {
  if (!previous || previous <= current) return null;
  return Math.round(((previous - current) / previous) * 100);
}

export function formatOfferValidity(validUntil: string) {
  const date = new Date(validUntil);
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Expira hoje";
  if (diffDays === 1) return "Expira amanhã";
  if (diffDays <= 7) return `Expira em ${diffDays} dias`;

  return `Válido até ${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })}`;
}
