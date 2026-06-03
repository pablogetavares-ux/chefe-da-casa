import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUTPUT = resolve("src/types/database.ts");
const EXTRA = `
export type Profile = Tables<"profiles">;
export type User = Profile;
export type Recipe = Tables<"recipes">;
export type PantryItem = Tables<"pantry_items">;
export type Ingredient = Tables<"ingredients">;
export type RecipeIngredientRow = Tables<"recipe_ingredients">;
export type Favorite = Tables<"favorites">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingListItem = Tables<"shopping_list_items">;
export type Subscription = Tables<"subscriptions">;
export type IngredientScan = Tables<"ingredient_scans">;
export type AiGeneration = Tables<"ai_generations">;
export type UsageLog = Tables<"usage_logs">;
`;

const mcp = JSON.parse(
  readFileSync(resolve("scripts/mcp-types.json"), "utf-8"),
);
writeFileSync(OUTPUT, mcp.types + EXTRA);
console.log("Restored", OUTPUT);
