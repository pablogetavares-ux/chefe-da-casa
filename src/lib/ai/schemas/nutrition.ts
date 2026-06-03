import { z } from "zod";

export const nutritionSchema = z.object({
  caloriesPerServing: z.number().int().min(0),
  proteinGrams: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatGrams: z.number().min(0),
  fiberGrams: z.number().min(0).default(0),
});

export type NutritionInfo = z.infer<typeof nutritionSchema>;

export const NUTRITION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    caloriesPerServing: { type: "integer" },
    proteinGrams: { type: "number" },
    carbsGrams: { type: "number" },
    fatGrams: { type: "number" },
    fiberGrams: { type: "number" },
  },
  required: [
    "caloriesPerServing",
    "proteinGrams",
    "carbsGrams",
    "fatGrams",
    "fiberGrams",
  ],
} as const;

export const substitutionSchema = z.object({
  original: z.string().min(1),
  substitute: z.string().min(1),
  reason: z.string().min(1),
});

export type IngredientSubstitution = z.infer<typeof substitutionSchema>;

export const SUBSTITUTION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    original: { type: "string" },
    substitute: { type: "string" },
    reason: { type: "string" },
  },
  required: ["original", "substitute", "reason"],
} as const;
