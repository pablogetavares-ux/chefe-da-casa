import { z } from "zod";

import { recipeCostIngredientSchema } from "@/lib/validations/recipe-cost";

export const substitutionsQuerySchema = z.object({
  recipeId: z.string().uuid("ID de receita inválido").optional(),
  marketName: z.string().trim().min(1).max(80).optional(),
  applySubstitutions: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1"),
  catalogOnly: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export const substitutionsBodySchema = z
  .object({
    recipeId: z.string().uuid().optional(),
    title: z.string().trim().max(200).optional(),
    ingredients: z.array(recipeCostIngredientSchema).max(50).optional(),
    marketName: z.string().trim().min(1).max(80).optional(),
    applySubstitutions: z.boolean().optional(),
    catalogOnly: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.catalogOnly ||
      data.recipeId ||
      (data.ingredients && data.ingredients.length > 0),
    {
      message: "Informe recipeId, ingredients ou use catalogOnly",
    },
  );

export type SubstitutionsQueryInput = z.infer<typeof substitutionsQuerySchema>;
export type SubstitutionsBodyInput = z.infer<typeof substitutionsBodySchema>;
