import { z } from "zod";

export const recipeCostIngredientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().positive(),
  unit: z.string().trim().min(1).max(30),
  optional: z.boolean().optional(),
});

export const recipeCostQuerySchema = z.object({
  recipeId: z.string().uuid("ID de receita inválido"),
  includeSubstitutions: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export const recipeCostBodySchema = z
  .object({
    recipeId: z.string().uuid().optional(),
    title: z.string().trim().max(200).optional(),
    servings: z.coerce.number().int().min(1).max(24).optional(),
    ingredients: z.array(recipeCostIngredientSchema).min(1).max(50),
    includeSubstitutions: z.boolean().optional(),
  })
  .refine((data) => data.recipeId || data.ingredients.length > 0, {
    message: "Informe recipeId ou ingredients",
  });

export type RecipeCostIngredientInput = z.infer<
  typeof recipeCostIngredientSchema
>;
