/** Bloco de exports de conveniência anexado ao output do MCP generate_typescript_types. */
export const DATABASE_TYPE_EXPORTS = `
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
export type RegionalOfferRow = Tables<"regional_offers">;
export type RegionalStoreRow = Tables<"regional_stores">;
export type OfferFavorite = Tables<"offer_favorites">;
export type OfferCategory = Enums<"OfferCategory">;
export type OfferVerticalRow = Tables<"offer_verticals">;
export type OfferCategoryRow = Tables<"offer_categories">;
export type MonthlyPurchaseListRow = Tables<"monthly_purchase_lists">;
export type MonthlyPurchaseItemRow = Tables<"monthly_purchase_items">;
`;
