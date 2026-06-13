import type {
  ApiResponse,
  GenerateRecipeRequest,
  IngredientSubstitution,
  NutritionInfo,
  ScanAndGenerateRequest,
  ScanIngredientsRequest,
  ScanIngredientsResponse,
} from "@/types";
import type {
  PantryItem,
  Profile,
  Recipe,
  ShoppingListItem,
  Subscription,
} from "@/types/database";
import type {
  AntiWasteGenerateInput,
  PantryItemInput,
  PantryItemUpdateInput,
  ProfileUpdateInput,
  DeleteAccountInput,
  ShoppingListItemInput,
  ShoppingListItemUpdateInput,
} from "@/lib/validations";
import type { PlanId } from "@/config/plans";
import type { BillingHealth } from "@/lib/billing/subscription-state";
import {
  ApiClientError,
  networkErrorMessage,
  timeoutErrorMessage,
} from "@/lib/api/client-errors";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export { ApiClientError } from "@/lib/api/client-errors";

export class UnauthorizedError extends Error {
  constructor(message = "Não autenticado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const next = getSafeRedirectPath(window.location.pathname);
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
}

export type AiStatusResponse = {
  configured: boolean;
  mock: boolean;
  model: string;
  visionModel: string;
};

export type AiUsageSummary = {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
};

/** Perfil autenticado + flag de admin (e-mail em ADMIN_EMAILS). */
export type ProfileMe = Profile & { isAdmin?: boolean };

export type GenerateRecipeResponse = {
  recipe: Recipe;
  generationId: string;
  cached?: boolean;
  usage: Pick<AiUsageSummary, "used" | "limit" | "remaining">;
};

export type AiUsagePayload = Pick<
  AiUsageSummary,
  "used" | "limit" | "remaining"
>;

export type AdaptRecipeResponse = {
  recipe: Recipe;
  usage: AiUsagePayload;
};

export type AiSubstitutionsResponse = {
  substitutions: IngredientSubstitution[];
  usage: AiUsagePayload;
};

export type CatalogSubstitutionsResponse =
  import("@/modules/substitutions/types").SubstitutionsResponse;

export type MacrosResponse = {
  nutrition: NutritionInfo;
  notes?: string;
  usage: AiUsagePayload;
};

export type AiHistoryItem = {
  id: string;
  status: string;
  createdAt: string;
  recipeId: string | null;
  recipeTitle: string | null;
  mode: string;
  summary: string;
  latencyMs: number | null;
  totalTokens: number;
  model: string;
};

export type AiHistoryResponse = {
  items: AiHistoryItem[];
};

export type FavoritesResponse = {
  recipes: Recipe[];
  recipeIds: string[];
};

export type RecipesListResponse = {
  items: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type ShoppingListResponse =
  import("@/modules/shopping/types").SmartShoppingListResponse;

export type ShoppingListsMetaResponse =
  import("@/modules/shopping/types").ShoppingListsResponse;

export type AddFromFavoritesResponse =
  import("@/modules/shopping/types").AddFromFavoritesResponse;

export type AddFromRecipeResponse = {
  added: number;
  skipped: number;
  items: ShoppingListItem[];
  recipeTitle?: string;
  message?: string;
};

export type GenerateShoppingListResponse =
  import("@/modules/shopping/types").GenerateShoppingListResponse;

export type BillingSubscriptionResponse = {
  plan: string;
  subscription: Subscription | null;
  billingHealth: BillingHealth;
};

export type PlanUsageSummary = {
  plan: string;
  ai: { used: number; limit: number; remaining: number; plan: string };
  pantry: { used: number; limit: number };
  favorites: { used: number; limit: number };
  recipes: { used: number; limit: number };
};

export type BillingUrlResponse = {
  url: string;
  mock?: boolean;
};

type FetchApiOptions = RequestInit & {
  /** Evita redirect imediato (ex.: query aguardando sessão no client). */
  redirectOnUnauthorized?: boolean;
  /** Timeout da requisição em ms (padrão 30s). */
  timeoutMs?: number;
};

const DEFAULT_FETCH_TIMEOUT_MS = 30_000;

async function fetchApi<T>(url: string, init?: FetchApiOptions): Promise<T> {
  const {
    redirectOnUnauthorized = true,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
    ...requestInit
  } = init ?? {};

  let res: Response;
  try {
    res = await fetch(url, {
      ...requestInit,
      credentials: "same-origin",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "Content-Type": "application/json",
        ...requestInit.headers,
      },
    });
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new ApiClientError(timeoutErrorMessage(), "TIMEOUT");
    }
    throw new ApiClientError(networkErrorMessage(), "NETWORK_ERROR");
  }

  if (res.status === 401) {
    if (redirectOnUnauthorized) {
      redirectToLogin();
    }
    throw new UnauthorizedError();
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      res.ok
        ? "Resposta inválida do servidor."
        : `Erro ${res.status}: serviço indisponível.`,
      "INVALID_RESPONSE",
      res.status,
    );
  }

  if (!json.success) {
    throw new ApiClientError(
      json.error ?? `Erro ${res.status}`,
      json.code,
      res.status,
    );
  }

  if (!res.ok) {
    throw new ApiClientError(`Erro ${res.status}`, undefined, res.status);
  }

  return json.data;
}

export type AntiWasteSummaryResponse =
  import("@/lib/queries/anti-waste").AntiWasteSummary;

export type AntiWasteGenerateResponse = {
  recipe: Recipe;
  generationId: string;
  wasteReduction: {
    prioritizedIngredients: string[];
    tips: string[];
    repurposingIdeas: string[];
  };
  usage: AiUsagePayload;
};

export const api = {
  profile: {
    get: () => fetchApi<ProfileMe>("/api/v1/profile"),
    update: (data: ProfileUpdateInput) =>
      fetchApi<ProfileMe>("/api/v1/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    exportData: async () => {
      const response = await fetch("/api/v1/profile/export", {
        credentials: "include",
      });
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? "Erro ao exportar dados");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "meus-dados.json";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    deleteAccount: (data: DeleteAccountInput) =>
      fetchApi<{ deleted: true }>("/api/v1/profile/account", {
        method: "DELETE",
        body: JSON.stringify(data),
      }),
  },
  pantry: {
    list: () => fetchApi<PantryItem[]>("/api/v1/pantry"),
    create: (data: PantryItemInput) =>
      fetchApi<PantryItem>("/api/v1/pantry", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: PantryItemUpdateInput) =>
      fetchApi<PantryItem>(`/api/v1/pantry/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<{ id: string }>(`/api/v1/pantry/${id}`, {
        method: "DELETE",
      }),
  },
  recipes: {
    list: (params?: { page?: number; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      return fetchApi<RecipesListResponse>(
        `/api/v1/recipes${query ? `?${query}` : ""}`,
      );
    },
    delete: (id: string) =>
      fetchApi<{ id: string }>(`/api/v1/recipes/${id}`, {
        method: "DELETE",
      }),
  },
  favorites: {
    list: () => fetchApi<FavoritesResponse>("/api/v1/favorites"),
    add: (recipeId: string) =>
      fetchApi<{ id: string; recipeId: string }>("/api/v1/favorites", {
        method: "POST",
        body: JSON.stringify({ recipeId }),
      }),
    remove: (recipeId: string) =>
      fetchApi<{ recipeId: string }>(
        `/api/v1/favorites?recipeId=${encodeURIComponent(recipeId)}`,
        { method: "DELETE" },
      ),
  },
  ai: {
    status: () => fetchApi<AiStatusResponse>("/api/v1/ai/status"),
    usage: () => fetchApi<AiUsageSummary>("/api/v1/ai/usage"),
    generate: (data: GenerateRecipeRequest) =>
      fetchApi<GenerateRecipeResponse>("/api/v1/ai/generate-recipe", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    adapt: (data: {
      recipeId: string;
      targetDiet: string;
      instruction?: string;
    }) =>
      fetchApi<AdaptRecipeResponse>("/api/v1/ai/adapt-recipe", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    substitutions: (data: { recipeId: string; reason?: string }) =>
      fetchApi<AiSubstitutionsResponse>("/api/v1/ai/substitutions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    macros: (recipeId: string) =>
      fetchApi<MacrosResponse>("/api/v1/ai/macros", {
        method: "POST",
        body: JSON.stringify({ recipeId }),
      }),
    refine: (data: { recipeId: string; instruction: string }) =>
      fetchApi<AdaptRecipeResponse>("/api/v1/ai/refine-recipe", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    history: () => fetchApi<AiHistoryResponse>("/api/v1/ai/history"),
    uploadScan: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/ai/upload-scan", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (res.status === 401) {
        redirectToLogin();
        throw new UnauthorizedError();
      }

      const json = (await res.json()) as ApiResponse<{
        storagePath: string;
        bucket: string;
      }>;

      if (!json.success) {
        throw new Error(json.error);
      }

      return json.data;
    },
    scanIngredients: (data: ScanIngredientsRequest) =>
      fetchApi<ScanIngredientsResponse>("/api/v1/ai/scan-ingredients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    scanAndGenerate: (data: ScanAndGenerateRequest) =>
      fetchApi<
        GenerateRecipeResponse & {
          scan: {
            ingredientNames: string[];
            sceneDescription: string;
            suggestions: string[];
          };
        }
      >("/api/v1/ai/scan-and-generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    chat: (messages: Array<{ role: "user" | "assistant"; content: string }>) =>
      fetchApi<{
        message: { role: "assistant"; content: string };
        mock?: boolean;
      }>("/api/v1/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
      }),
    antiWaste: (data: AntiWasteGenerateInput) =>
      fetchApi<AntiWasteGenerateResponse>("/api/v1/ai/anti-waste", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  antiWaste: {
    summary: () =>
      fetchApi<AntiWasteSummaryResponse>("/api/v1/anti-waste/summary"),
  },
  shoppingList: {
    get: (listId?: string) => {
      const query = listId ? `?listId=${encodeURIComponent(listId)}` : "";
      return fetchApi<ShoppingListResponse>(`/api/v1/shopping-list${query}`);
    },
    getLists: () =>
      fetchApi<ShoppingListsMetaResponse>("/api/v1/shopping-list/lists"),
    createList: (name: string) =>
      fetchApi<{ id: string; name: string }>("/api/v1/shopping-list/lists", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    updateList: (id: string, data: { name?: string; notes?: string | null }) =>
      fetchApi<{ id: string; name: string }>(
        `/api/v1/shopping-list/lists/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    deleteList: (id: string) =>
      fetchApi<{ id: string }>(`/api/v1/shopping-list/lists/${id}`, {
        method: "DELETE",
      }),
    addItem: (data: ShoppingListItemInput) =>
      fetchApi<ShoppingListItem>("/api/v1/shopping-list/items", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateItem: (id: string, data: ShoppingListItemUpdateInput) =>
      fetchApi<ShoppingListItem>(`/api/v1/shopping-list/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteItem: (id: string) =>
      fetchApi<{ id: string }>(`/api/v1/shopping-list/items/${id}`, {
        method: "DELETE",
      }),
    addFromRecipe: (recipeId: string, listId?: string) =>
      fetchApi<AddFromRecipeResponse>("/api/v1/shopping-list/from-recipe", {
        method: "POST",
        body: JSON.stringify({ recipeId, listId }),
      }),
    generateFromRecipes: (data: {
      recipeIds: string[];
      listId?: string;
      excludePantry?: boolean;
      persist?: boolean;
    }) =>
      fetchApi<GenerateShoppingListResponse>("/api/v1/shopping-list", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    addFromFavorites: (listId?: string) =>
      fetchApi<AddFromFavoritesResponse>(
        "/api/v1/shopping-list/from-favorites",
        {
          method: "POST",
          body: JSON.stringify(listId ? { listId } : {}),
        },
      ),
    linkOffer: (itemId: string, offerId: string) =>
      fetchApi<ShoppingListItem>("/api/v1/shopping-list/link-offer", {
        method: "POST",
        body: JSON.stringify({ itemId, offerId }),
      }),
    clearChecked: (listId?: string) => {
      const query = listId ? `?listId=${encodeURIComponent(listId)}` : "";
      return fetchApi<{ removed: number }>(
        `/api/v1/shopping-list/checked${query}`,
        { method: "DELETE" },
      );
    },
  },
  billing: {
    subscription: () =>
      fetchApi<BillingSubscriptionResponse>("/api/v1/billing/subscription"),
    planUsage: () => fetchApi<PlanUsageSummary>("/api/v1/billing/plan-usage"),
    checkout: (planId: PlanId) =>
      fetchApi<BillingUrlResponse>("/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planId }),
      }),
    portal: () =>
      fetchApi<BillingUrlResponse>("/api/v1/billing/portal", {
        method: "POST",
      }),
  },
  admin: {
    access: () => fetchApi<{ isAdmin: boolean }>("/api/v1/admin/access"),
    stats: () => fetchApi<import("@/types").AdminStats>("/api/v1/admin/stats"),
    users: (params?: { page?: number; limit?: number; q?: string }) => {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      if (params?.q) search.set("q", params.q);
      const qs = search.toString();
      return fetchApi<
        import("@/types").AdminPaginated<import("@/types").AdminUserRow>
      >(`/api/v1/admin/users${qs ? `?${qs}` : ""}`);
    },
    offers: (params?: { page?: number; limit?: number; q?: string }) => {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      if (params?.q) search.set("q", params.q);
      const qs = search.toString();
      return fetchApi<
        import("@/types").AdminPaginated<import("@/types").AdminOfferRow>
      >(`/api/v1/admin/offers${qs ? `?${qs}` : ""}`);
    },
    activity: (limit = 40) =>
      fetchApi<{ items: import("@/types").AdminActivityRow[] }>(
        `/api/v1/admin/activity?limit=${limit}`,
      ),
    launchChecklist: () =>
      fetchApi<import("@/lib/runtime/launch-readiness").LaunchReadiness>(
        "/api/v1/launch-checklist",
      ),
  },
  home: {
    feed: (city?: string) => {
      const query = city ? `?city=${encodeURIComponent(city)}` : "";
      return fetchApi<import("@/modules/home/types").HomeFeedResponse>(
        `/api/v1/home${query}`,
      );
    },
  },
  offers: {
    getHub: () =>
      fetchApi<import("@/modules/offers/types").OffersHubResponse>(
        "/api/v1/offers/hub",
      ),
    list: (params?: {
      city?: string;
      state?: string;
      radiusKm?: number;
      scope?: import("@/modules/offers/region/types").OfferRegionScope;
      verticalSlug?: string;
      categorySlug?: string;
      category?: string;
      q?: string;
      searchScope?: import("@/modules/offers/utils/search").OfferSearchScope;
      sortBy?: import("@/modules/offers/utils/search").OfferSortBy;
      favoritesOnly?: boolean;
    }) => {
      const search = new URLSearchParams();
      if (params?.city) search.set("city", params.city);
      if (params?.state) search.set("state", params.state);
      if (params?.radiusKm) search.set("radiusKm", String(params.radiusKm));
      if (params?.scope) search.set("scope", params.scope);
      if (params?.verticalSlug) search.set("verticalSlug", params.verticalSlug);
      if (params?.categorySlug) search.set("categorySlug", params.categorySlug);
      if (params?.category) search.set("category", params.category);
      if (params?.q) search.set("q", params.q);
      if (params?.searchScope) search.set("searchScope", params.searchScope);
      if (params?.sortBy) search.set("sortBy", params.sortBy);
      if (params?.favoritesOnly) search.set("favoritesOnly", "true");
      const query = search.toString();
      return fetchApi<import("@/modules/offers/types").OffersListResponse>(
        `/api/v1/offers${query ? `?${query}` : ""}`,
      );
    },
    getRegion: () =>
      fetchApi<
        import("@/modules/offers/region/types").OfferRegionConfigResponse
      >("/api/v1/offers/region"),
    updateRegion: (body: { city: string; state: string; radiusKm: number }) =>
      fetchApi<
        import("@/modules/offers/region/types").OfferRegionConfigResponse
      >("/api/v1/offers/region", { method: "PUT", body: JSON.stringify(body) }),
    listStores: () =>
      fetchApi<{
        stores: import("@/modules/offers/region/types").RegionalStoreGeo[];
      }>("/api/v1/offers/stores"),
    forRecipe: (
      recipeId: string,
      options?: {
        city?: string;
        state?: string;
        radiusKm?: number;
        scope?: import("@/modules/offers/region/types").OfferRegionScope;
      },
    ) => {
      const search = new URLSearchParams({ recipeId });
      if (options?.city) search.set("city", options.city);
      if (options?.state) search.set("state", options.state);
      if (options?.radiusKm) search.set("radiusKm", String(options.radiusKm));
      if (options?.scope) search.set("scope", options.scope);
      return fetchApi<import("@/modules/offers/types").OffersForRecipeResponse>(
        `/api/v1/offers/for-recipe?${search.toString()}`,
      );
    },
    forPantry: (options?: {
      city?: string;
      state?: string;
      radiusKm?: number;
    }) => {
      const search = new URLSearchParams();
      if (options?.city) search.set("city", options.city);
      if (options?.state) search.set("state", options.state);
      if (options?.radiusKm) search.set("radiusKm", String(options.radiusKm));
      const query = search.toString();
      return fetchApi<import("@/modules/offers/types").PantryOffersResponse>(
        `/api/v1/offers/for-pantry${query ? `?${query}` : ""}`,
      );
    },
    getIntegrationContext: () =>
      fetchApi<
        import("@/modules/offers/types").OffersIntegrationContextResponse
      >("/api/v1/offers/context"),
    forAntiWaste: (options?: {
      city?: string;
      state?: string;
      radiusKm?: number;
    }) => {
      const search = new URLSearchParams();
      if (options?.city) search.set("city", options.city);
      if (options?.state) search.set("state", options.state);
      if (options?.radiusKm) search.set("radiusKm", String(options.radiusKm));
      const query = search.toString();
      return fetchApi<
        import("@/modules/offers/types").IngredientOffersResponse
      >(`/api/v1/offers/for-anti-waste${query ? `?${query}` : ""}`);
    },
    forIngredients: (body: {
      names: string[];
      context?: "weekly_plan" | "ingredients";
      city?: string;
      state?: string;
      radiusKm?: number;
    }) =>
      fetchApi<import("@/modules/offers/types").IngredientOffersResponse>(
        "/api/v1/offers/for-ingredients",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    addFavorite: (offerId: string) =>
      fetchApi<{ id: string; offerId: string }>("/api/v1/offers/favorites", {
        method: "POST",
        body: JSON.stringify({ offerId }),
      }),
    removeFavorite: (offerId: string) =>
      fetchApi<{ offerId: string }>(
        `/api/v1/offers/favorites?offerId=${encodeURIComponent(offerId)}`,
        { method: "DELETE" },
      ),
    addToShopping: (offerId: string, listId?: string) =>
      fetchApi<{ added: boolean; message?: string }>(
        "/api/v1/offers/add-to-shopping",
        {
          method: "POST",
          body: JSON.stringify({ offerId, listId }),
        },
      ),
  },
  weeklyPlan: {
    generate: (params: {
      goal: "economizar" | "saude" | "proteina";
      startsOn?: string;
      excludePantry?: boolean;
      persist?: boolean;
    }) => {
      const search = new URLSearchParams({ goal: params.goal });
      if (params.startsOn) search.set("startsOn", params.startsOn);
      if (params.excludePantry === false) search.set("excludePantry", "false");
      if (params.persist) search.set("persist", "true");
      return fetchApi<
        import("@/lib/weekly-plan/compute-weekly-plan").WeeklyPlanResult & {
          planId: string | null;
        }
      >(`/api/v1/weekly-plan?${search.toString()}`);
    },
    generatePost: (body: {
      goal: "economizar" | "saude" | "proteina";
      startsOn?: string;
      excludePantry?: boolean;
      persist?: boolean;
    }) =>
      fetchApi<
        import("@/lib/weekly-plan/compute-weekly-plan").WeeklyPlanResult & {
          planId: string | null;
        }
      >("/api/v1/weekly-plan", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  economy: {
    dashboard: () =>
      fetchApi<import("@/modules/economy/types").EconomyDashboardResponse>(
        "/api/v1/economy/dashboard",
      ),
  },
  monthlyPurchases: {
    get: (month: number, year: number, ensure = false) => {
      const search = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      if (ensure) search.set("ensure", "true");
      return fetchApi<
        import("@/modules/monthly-purchases/types").MonthShoppingListWithItems
      >(`/api/v1/monthly-purchases?${search.toString()}`);
    },
    copySuggestion: (month: number, year: number) => {
      const search = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      return fetchApi<
        import("@/modules/monthly-purchases/types").MonthCopySuggestion
      >(`/api/v1/monthly-purchases/copy-suggestion?${search.toString()}`);
    },
    copyFromMonth: (
      month: number,
      year: number,
      sourceMonth: number,
      sourceYear: number,
    ) =>
      fetchApi<
        import("@/modules/monthly-purchases/types").MonthShoppingListWithItems
      >("/api/v1/monthly-purchases/copy-from-previous", {
        method: "POST",
        body: JSON.stringify({
          month,
          year,
          sourceMonth,
          sourceYear,
        }),
      }),
    history: () =>
      fetchApi<
        import("@/modules/monthly-purchases/types").MonthPurchaseHistoryResponse
      >("/api/v1/monthly-purchases/history"),
    dashboard: (month: number, year: number) => {
      const search = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      return fetchApi<
        import("@/modules/monthly-purchases/types").MonthPurchaseDashboard
      >(`/api/v1/monthly-purchases/dashboard?${search.toString()}`);
    },
    createList: (month: number, year: number) =>
      fetchApi<
        import("@/modules/monthly-purchases/types").MonthShoppingListWithItems
      >("/api/v1/monthly-purchases", {
        method: "POST",
        body: JSON.stringify({ month, year }),
      }),
    addItem: (
      body: import("@/lib/validations/monthly-purchases").MonthPurchaseItemCreateInput,
    ) =>
      fetchApi<
        import("@/modules/monthly-purchases/types").MonthShoppingListWithItems
      >("/api/v1/monthly-purchases/items", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateItem: (
      id: string,
      body: import("@/lib/validations/monthly-purchases").MonthPurchaseItemUpdateInput,
    ) =>
      fetchApi<
        import("@/modules/monthly-purchases/types").MonthShoppingListWithItems
      >(`/api/v1/monthly-purchases/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    deleteItem: (id: string) =>
      fetchApi<
        | import("@/modules/monthly-purchases/types").MonthShoppingListWithItems
        | null
      >(`/api/v1/monthly-purchases/items/${id}`, { method: "DELETE" }),
  },
  substitutions: {
    forRecipe: (
      recipeId: string,
      options?: { applySubstitutions?: boolean; marketName?: string },
    ) => {
      const search = new URLSearchParams({ recipeId });
      if (options?.applySubstitutions) search.set("applySubstitutions", "true");
      if (options?.marketName) search.set("marketName", options.marketName);
      return fetchApi<CatalogSubstitutionsResponse>(
        `/api/v1/substitutions?${search.toString()}`,
        { redirectOnUnauthorized: false },
      );
    },
    suggest: (body: {
      recipeId?: string;
      ingredients?: Array<{
        name: string;
        quantity: number;
        unit: string;
        optional?: boolean;
      }>;
      marketName?: string;
      applySubstitutions?: boolean;
    }) =>
      fetchApi<CatalogSubstitutionsResponse>("/api/v1/substitutions", {
        method: "POST",
        body: JSON.stringify(body),
        redirectOnUnauthorized: false,
      }),
  },
  markets: {
    compare: (listId?: string) => {
      const query = listId ? `?listId=${encodeURIComponent(listId)}` : "";
      return fetchApi<
        import("@/lib/markets/compare-shopping-list").MarketsCompareResult
      >(`/api/v1/markets/compare${query}`);
    },
    comparePost: (
      body: import("@/lib/validations/markets").MarketsCompareBodyInput,
    ) =>
      fetchApi<
        import("@/lib/markets/compare-shopping-list").MarketsCompareResult
      >("/api/v1/markets/compare", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  pricing: {
    compareList: (params: { city: string; listId?: string }) => {
      const search = new URLSearchParams({
        city: params.city,
        mode: "list",
      });
      if (params.listId) search.set("listId", params.listId);
      return fetchApi<
        import("@/modules/pricing/types").PriceComparisonResponse
      >(`/api/v1/pricing/compare?${search.toString()}`);
    },
    compareBasket: (city: string) => {
      const search = new URLSearchParams({ city, mode: "basket" });
      return fetchApi<
        import("@/modules/pricing/types").PriceComparisonResponse
      >(`/api/v1/pricing/compare?${search.toString()}`);
    },
    compareCustom: (data: {
      city: string;
      items: Array<{ name: string; quantity?: number }>;
    }) =>
      fetchApi<import("@/modules/pricing/types").PriceComparisonResponse>(
        "/api/v1/pricing/compare",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
  },
};
