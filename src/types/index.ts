export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

/** Tipos do banco (Supabase) — snake_case */
export type {
  AiGeneration,
  Favorite,
  Ingredient,
  IngredientScan,
  PantryItem,
  Profile,
  Recipe,
  RecipeIngredientRow,
  ShoppingList,
  ShoppingListItem,
  Subscription,
  Tables,
  TablesInsert,
  UsageLog,
  User,
} from "@/types/database";

/** Tipos de domínio para camada de IA (camelCase) */
export type RecipeIngredient = {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
};

export type GenerateRecipeRequest = {
  ingredients: string[];
  dietaryPreferences?: string[];
  preparationStyle?:
    | "bolo"
    | "pudim"
    | "torta"
    | "mingau"
    | "mousse"
    | "creme"
    | "vitamina"
    | "refogado"
    | "assado";
  servings?: number;
  maxPrepTimeMinutes?: number;
  mode?: "STANDARD" | "ECONOMIC" | "FITNESS" | "SENIOR" | "LOW_CARB" | "VEGAN";
  forceRegenerate?: boolean;
  fitnessGoals?: {
    calorieTarget?: number;
    proteinMinGrams?: number;
  };
};

export type ScanIngredientsRequest = {
  storagePath?: string;
  imageBase64?: string;
  mimeType?: string;
  context?: string;
  addToPantry?: boolean;
};

export type ScanIngredientsResponse = {
  scanId: string;
  ingredients: Array<{
    name: string;
    confidence: "high" | "medium" | "low";
    quantityEstimate?: string;
    category?: string;
  }>;
  ingredientNames: string[];
  sceneDescription: string;
  suggestions: string[];
  storagePath?: string;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
};

export type ScanAndGenerateRequest = ScanIngredientsRequest & {
  mode?: GenerateRecipeRequest["mode"];
  servings?: number;
  maxPrepTimeMinutes?: number;
  dietaryPreferences?: string[];
  fitnessGoals?: GenerateRecipeRequest["fitnessGoals"];
  forceRegenerate?: boolean;
};

export type NutritionInfo = {
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
};

export type IngredientSubstitution = {
  original: string;
  substitute: string;
  reason: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

export type ChatMessageInput = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  message: Omit<ChatMessage, "id">;
  mock?: boolean;
};

export type {
  AdminStats,
  AdminUserRow,
  AdminOfferRow,
  AdminActivityRow,
  AdminPaginated,
} from "@/modules/admin/types";
