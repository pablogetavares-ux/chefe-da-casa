import type { RecipeIngredient } from "@/types";

export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function buildPantryNameSet(pantryNames: string[]): Set<string> {
  return new Set(pantryNames.map(normalizeIngredientName));
}

export function isIngredientInPantry(
  ingredientName: string,
  pantryNames: Set<string>,
): boolean {
  const normalized = normalizeIngredientName(ingredientName);
  if (pantryNames.has(normalized)) return true;

  for (const pantryName of pantryNames) {
    if (pantryName.includes(normalized) || normalized.includes(pantryName)) {
      return true;
    }
  }

  return false;
}

export function getMissingIngredients(
  recipeIngredients: RecipeIngredient[],
  pantryItemNames: string[],
): RecipeIngredient[] {
  const pantryNames = buildPantryNameSet(pantryItemNames);

  return recipeIngredients.filter(
    (ingredient) =>
      !ingredient.optional &&
      !isIngredientInPantry(ingredient.name, pantryNames),
  );
}
