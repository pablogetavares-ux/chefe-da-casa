import { z } from "zod";

export const detectedIngredientSchema = z.object({
  name: z.string().min(1),
  confidence: z.enum(["high", "medium", "low"]),
  quantityEstimate: z.string().optional(),
  category: z.string().optional(),
});

export const scanResultSchema = z.object({
  ingredients: z.array(detectedIngredientSchema).min(1).max(30),
  sceneDescription: z.string().min(1),
  suggestions: z.array(z.string()).default([]),
});

export type ScanResult = z.infer<typeof scanResultSchema>;
export type DetectedIngredient = z.infer<typeof detectedIngredientSchema>;

export const SCAN_RESULT_JSON_SCHEMA = {
  name: "ingredient_scan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      ingredients: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            quantityEstimate: { type: "string" },
            category: { type: "string" },
          },
          required: ["name", "confidence", "quantityEstimate", "category"],
        },
      },
      sceneDescription: { type: "string" },
      suggestions: { type: "array", items: { type: "string" } },
    },
    required: ["ingredients", "sceneDescription", "suggestions"],
  },
} as const;
