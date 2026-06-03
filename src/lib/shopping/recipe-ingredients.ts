import type { RecipeIngredient } from "@/types";

export function parseRecipeIngredients(raw: unknown): RecipeIngredient[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const quantity =
        typeof row.quantity === "number" ? row.quantity : Number(row.quantity);
      const unit = typeof row.unit === "string" ? row.unit.trim() : "un";
      const optional = Boolean(row.optional);

      if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;

      return {
        name,
        quantity,
        unit,
        ...(optional ? { optional: true } : {}),
      };
    })
    .filter((row): row is RecipeIngredient => row !== null);
}
