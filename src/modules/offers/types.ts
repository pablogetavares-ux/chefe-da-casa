import type { OfferRegionScope } from "@/modules/offers/region/types";
import type { Enums, Tables } from "@/types/database";

export type OfferCategory = Enums<"OfferCategory">;
export type RegionalOfferRow = Tables<"regional_offers">;
export type RegionalStoreRow = Tables<"regional_stores">;
export type OfferVerticalRow = Tables<"offer_verticals">;
export type OfferCategoryRow = Tables<"offer_categories">;

/** Vertical de mercado (supermercado, farmácia, etc.) — catálogo dinâmico. */
export type OfferVerticalCatalogItem = {
  id: string;
  slug: string;
  name: string;
  iconKey: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  /** Ofertas ativas na região (todas as cidades — hub). */
  activeOfferCount?: number;
};

/** Resposta do hub Central de Ofertas. */
export type OffersHubResponse = {
  verticals: OfferVerticalCatalogItem[];
};

/** Categoria dinâmica por vertical — extensível sem migration. */
export type OfferCategoryCatalogItem = {
  id: string;
  slug: string;
  name: string;
  verticalId: string;
  verticalSlug: string;
  legacyEnum: OfferCategory | null;
  parentId: string | null;
  sortOrder: number;
};

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
  /** Pontuação de relevância da busca (0–100), quando há termo de busca. */
  searchRelevance?: number;
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
  /** Verticais ativas (Central Multi-Ofertas). */
  verticals: OfferVerticalCatalogItem[];
  /** Categorias dinâmicas da vertical selecionada. */
  categoryCatalog: OfferCategoryCatalogItem[];
  /** @deprecated Preferir `categoryCatalog` — mantido para compatibilidade. */
  categories: OfferCategory[];
  favoriteIds: string[];
  region: import("@/modules/offers/region/types").UserOfferRegion;
  filters: {
    city: string | null;
    state: string | null;
    radiusKm: number;
    scope: OfferRegionScope;
    verticalSlug: string;
    categorySlug: string | null;
    /** @deprecated Preferir `categorySlug`. */
    category: OfferCategory | null;
    q: string | null;
    searchScope: import("@/modules/offers/utils/search").OfferSearchScope;
    sortBy: import("@/modules/offers/utils/search").OfferSortBy;
  };
  meta?: {
    total: number;
    hasSearch: boolean;
    searchExpanded?: boolean;
  };
};

export type OffersUserContextSummary = {
  plan: import("@/types/database").Database["public"]["Enums"]["PlanTier"];
  fitnessGoal: string | null;
  seniorMode: boolean;
  offerPreferences: import("@/modules/offers/types/offer-preferences").OfferPreferences;
  priorityCategories: OfferCategory[];
  priorityLabels: string[];
  personalizationReason: string | null;
};

/** Modo do hero comercial no topo da receita (sem foto). */
export type RecipeHeroMode = "ingredients" | "regional" | "explore";

export type OffersForRecipeResponse = {
  recipeId: string;
  recipeTitle: string;
  offers: RegionalOffer[];
  /** Até 3 ofertas para o hero — ingredientes ou fallback regional. */
  heroOffers: RegionalOffer[];
  heroMode: RecipeHeroMode;
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
  userContext: OffersUserContextSummary;
};

export function describeRecipeHeroMode(
  mode: RecipeHeroMode,
  city: string,
  stats: {
    heroOfferCount: number;
    matchedIngredientLabels: string[];
    totalOfferCount?: number;
  },
): string {
  const { heroOfferCount, matchedIngredientLabels, totalOfferCount } = stats;
  const matchedCount = matchedIngredientLabels.length;
  const labelSample = matchedIngredientLabels.slice(0, 3).join(", ");
  const extraLabels =
    matchedIngredientLabels.length > 3
      ? ` +${matchedIngredientLabels.length - 3}`
      : "";

  switch (mode) {
    case "ingredients": {
      if (heroOfferCount === 0) {
        return `Promoções em ${city} ligadas aos ingredientes desta receita`;
      }
      const offersLabel =
        heroOfferCount === 1 ? "1 promoção" : `${heroOfferCount} promoções`;
      if (matchedCount > 0) {
        const ingLabel =
          matchedCount === 1 ? "1 ingrediente" : `${matchedCount} ingredientes`;
        let line = `${offersLabel} em ${city} para ${ingLabel}: ${labelSample}${extraLabels}`;
        if (totalOfferCount && totalOfferCount > heroOfferCount) {
          line += ` — +${totalOfferCount - heroOfferCount} na lista completa`;
        }
        return line;
      }
      return `${offersLabel} em ${city} para ingredientes desta receita`;
    }
    case "regional":
      return heroOfferCount > 0
        ? `${heroOfferCount} destaque${heroOfferCount === 1 ? "" : "s"} do mercado em ${city}`
        : `Ofertas do mercado em ${city} — aproveite enquanto cozinha`;
    default:
      return "Central de Ofertas — economize em toda a rotina da casa";
  }
}

/** Ingredientes únicos com match nas ofertas (ordem de aparição). */
export function collectMatchedIngredientLabels(
  offers: RegionalOffer[],
): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const offer of offers) {
    for (const ing of offer.matchedIngredients ?? []) {
      const key = ing.toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      labels.push(ing);
    }
  }
  return labels;
}

export type PantryGapSource = "recipe" | "shopping_list";

export type PantryGapItem = {
  ingredientName: string;
  source: PantryGapSource;
  sourceLabel: string;
};

export type PantryOffersResponse = {
  gaps: PantryGapItem[];
  offers: RegionalOffer[];
  hasMatches: boolean;
  matchScope: OfferMatchScope;
  city: string;
  state: string;
  radiusKm: number;
  userContext: OffersUserContextSummary;
};

export type IngredientOffersContext =
  | "anti_waste"
  | "weekly_plan"
  | "pantry"
  | "ingredients";

export type IngredientOffersResponse = {
  ingredientNames: string[];
  offers: RegionalOffer[];
  hasMatches: boolean;
  matchScope: OfferMatchScope;
  city: string;
  state: string;
  radiusKm: number;
  userContext: OffersUserContextSummary;
  context: IngredientOffersContext;
};

export type OffersIntegrationContextResponse = {
  userContext: OffersUserContextSummary;
  region: import("@/modules/offers/region/types").UserOfferRegion;
  extensions: { slug: string; name: string; status: string }[];
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
