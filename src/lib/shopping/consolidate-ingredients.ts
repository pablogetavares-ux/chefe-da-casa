import { normalizeIngredientName } from "@/lib/shopping/missing-ingredients";
import { parseRecipeIngredients } from "@/lib/shopping/recipe-ingredients";
import {
  formatDisplayQuantity,
  toBaseQuantity,
  type UnitFamily,
} from "@/lib/shopping/units";
import {
  inferShoppingCategory,
  SHOPPING_CATEGORY_LABELS,
  SHOPPING_CATEGORY_ORDER,
} from "@/modules/shopping/constants/categories";
import type { ShoppingItemCategory } from "@/modules/shopping/types";
import type { RecipeIngredient } from "@/types";

export type RecipeIngredientSource = {
  id: string;
  title: string;
  ingredients: unknown;
};

export type ConsolidatedIngredient = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingItemCategory;
  categoryLabel: string;
  recipeIds: string[];
  recipeTitles: string[];
  unitFamily: UnitFamily | "unknown";
  estimated: boolean;
};

export type ConsolidatedShoppingList = {
  items: ConsolidatedIngredient[];
  groupedByCategory: Record<ShoppingItemCategory, ConsolidatedIngredient[]>;
  recipes: { id: string; title: string }[];
  totalLines: number;
};

type MergeBucket = {
  key: string;
  name: string;
  category: ShoppingItemCategory;
  unitFamily: UnitFamily | "unknown";
  baseLabel: string;
  baseValue: number;
  estimated: boolean;
  recipeIds: Set<string>;
  recipeTitles: Set<string>;
};

export function mergeKey(
  name: string,
  family: UnitFamily | "unknown",
  baseLabel: string,
) {
  return `${normalizeIngredientName(name)}::${family}::${baseLabel}`;
}

function pickDisplayName(current: string, next: string) {
  return next.length > current.length ? next : current;
}

function addToBucket(
  buckets: Map<string, MergeBucket>,
  ingredient: RecipeIngredient,
  recipe: { id: string; title: string },
) {
  if (ingredient.optional) return;

  const { family, baseValue, baseLabel, estimated } = toBaseQuantity(
    ingredient.quantity,
    ingredient.unit,
  );

  const key = mergeKey(ingredient.name, family, baseLabel);
  const existing = buckets.get(key);

  if (existing) {
    existing.baseValue += baseValue;
    existing.estimated = existing.estimated || estimated;
    existing.name = pickDisplayName(existing.name, ingredient.name);
    existing.recipeIds.add(recipe.id);
    existing.recipeTitles.add(recipe.title);
    return;
  }

  buckets.set(key, {
    key,
    name: ingredient.name,
    category: inferShoppingCategory(ingredient.name),
    unitFamily: family,
    baseLabel,
    baseValue,
    estimated,
    recipeIds: new Set([recipe.id]),
    recipeTitles: new Set([recipe.title]),
  });
}

export function consolidateIngredientsFromRecipes(
  recipes: RecipeIngredientSource[],
): ConsolidatedShoppingList {
  const buckets = new Map<string, MergeBucket>();

  for (const recipe of recipes) {
    const ingredients = parseRecipeIngredients(recipe.ingredients);
    for (const ingredient of ingredients) {
      addToBucket(buckets, ingredient, { id: recipe.id, title: recipe.title });
    }
  }

  const items: ConsolidatedIngredient[] = [...buckets.values()].map(
    (bucket) => {
      const display = formatDisplayQuantity(
        bucket.baseValue,
        bucket.unitFamily === "unknown" ? "count" : bucket.unitFamily,
        bucket.baseLabel,
      );

      return {
        key: bucket.key,
        name: bucket.name,
        quantity: display.quantity,
        unit: display.unit,
        category: bucket.category,
        categoryLabel: SHOPPING_CATEGORY_LABELS[bucket.category],
        recipeIds: [...bucket.recipeIds],
        recipeTitles: [...bucket.recipeTitles],
        unitFamily: bucket.unitFamily,
        estimated: bucket.estimated,
      };
    },
  );

  items.sort((a, b) => {
    const orderA = SHOPPING_CATEGORY_ORDER.indexOf(a.category);
    const orderB = SHOPPING_CATEGORY_ORDER.indexOf(b.category);
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, "pt-BR");
  });

  const groupedByCategory = {} as Record<
    ShoppingItemCategory,
    ConsolidatedIngredient[]
  >;

  for (const category of SHOPPING_CATEGORY_ORDER) {
    const group = items.filter((item) => item.category === category);
    if (group.length > 0) groupedByCategory[category] = group;
  }

  return {
    items,
    groupedByCategory,
    recipes: recipes.map((r) => ({ id: r.id, title: r.title })),
    totalLines: items.length,
  };
}
