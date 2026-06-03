import { z } from "zod";

import {
  GENERATED_RECIPE_JSON_SCHEMA,
  generatedRecipeSchema,
} from "@/lib/ai/schemas/recipe-output";

export const antiWasteMetaSchema = z.object({
  prioritizedIngredients: z.array(z.string()).min(1),
  wasteReductionTips: z.array(z.string()).min(1),
  repurposingIdeas: z.array(z.string()).min(1),
});

export const antiWasteRecipeSchema = generatedRecipeSchema.extend({
  prioritizedIngredients: z.array(z.string()).min(1),
  wasteReductionTips: z.array(z.string()).min(1),
  repurposingIdeas: z.array(z.string()).min(1),
});

export type AntiWasteRecipe = z.infer<typeof antiWasteRecipeSchema>;

export const ANTI_WASTE_RECIPE_JSON_SCHEMA = {
  name: "anti_waste_recipe",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      ...GENERATED_RECIPE_JSON_SCHEMA.schema.properties,
      prioritizedIngredients: {
        type: "array",
        items: { type: "string" },
      },
      wasteReductionTips: {
        type: "array",
        items: { type: "string" },
      },
      repurposingIdeas: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      ...GENERATED_RECIPE_JSON_SCHEMA.schema.required,
      "prioritizedIngredients",
      "wasteReductionTips",
      "repurposingIdeas",
    ],
  },
} as const;
