import type { IngredientSubstitutionSuggestion } from "@/lib/substitutions/suggest-cheaper";
import type { RecipeCostPayload } from "@/modules/recipes/services/recipe-cost";

export type SubstitutionsCatalogItem = {
  id: string;
  originalName: string;
  substituteName: string;
  reason: string;
  originalProductId: string | null;
  substituteProductId: string | null;
};

export type SubstitutionsResponse = {
  catalog: SubstitutionsCatalogItem[];
  suggestions: IngredientSubstitutionSuggestion[];
  estimatedTotalSavings: number;
  recipeId: string | null;
  recipeTitle: string | null;
  recipeCost: RecipeCostPayload | null;
  recipeCostWithSubstitutions: RecipeCostPayload | null;
};
