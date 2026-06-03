import { z } from "zod";

import {
  NUTRITION_JSON_SCHEMA,
  nutritionSchema,
  SUBSTITUTION_JSON_SCHEMA,
  substitutionSchema,
} from "@/lib/ai/schemas/nutrition";

import { RECIPE_GENERATION_MODES } from "@/lib/ai/constants/recipe-modes";

export const recipeModeSchema = z.enum(RECIPE_GENERATION_MODES);

export const generatedRecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.preprocess((val) => {
        if (val === null || val === undefined || val === "") return undefined;
        const n = Number(val);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      }, z.number().positive().optional()),
      unit: z.string().optional(),
      optional: z.boolean().optional(),
    }),
  ),
  instructions: z.array(
    z.object({
      step: z.number().int().positive(),
      text: z.string().min(1),
    }),
  ),
  prepTimeMinutes: z.number().int().min(0),
  cookTimeMinutes: z.number().int().min(0),
  servings: z.number().int().min(1).max(12),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).default([]),
  dietaryTags: z
    .array(
      z.enum([
        "VEGETARIAN",
        "VEGAN",
        "GLUTEN_FREE",
        "LACTOSE_FREE",
        "LOW_CARB",
        "KETO",
      ]),
    )
    .default([]),
  nutrition: nutritionSchema,
  substitutions: z.array(substitutionSchema).default([]),
  costTier: z.enum(["LOW", "MEDIUM", "HIGH"]),
  estimatedCostPerServing: z.number().min(0).nullable().optional(),
});

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>;

export const GENERATED_RECIPE_JSON_SCHEMA = {
  name: "generated_recipe",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" },
            optional: { type: "boolean" },
          },
          required: ["name", "quantity", "unit", "optional"],
        },
      },
      instructions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            step: { type: "integer" },
            text: { type: "string" },
          },
          required: ["step", "text"],
        },
      },
      prepTimeMinutes: { type: "integer" },
      cookTimeMinutes: { type: "integer" },
      servings: { type: "integer" },
      difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
      tags: { type: "array", items: { type: "string" } },
      dietaryTags: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "VEGETARIAN",
            "VEGAN",
            "GLUTEN_FREE",
            "LACTOSE_FREE",
            "LOW_CARB",
            "KETO",
          ],
        },
      },
      nutrition: NUTRITION_JSON_SCHEMA,
      substitutions: {
        type: "array",
        items: SUBSTITUTION_JSON_SCHEMA,
      },
      costTier: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
      estimatedCostPerServing: { type: ["number", "null"] },
    },
    required: [
      "title",
      "description",
      "ingredients",
      "instructions",
      "prepTimeMinutes",
      "cookTimeMinutes",
      "servings",
      "difficulty",
      "tags",
      "dietaryTags",
      "nutrition",
      "substitutions",
      "costTier",
      "estimatedCostPerServing",
    ],
  },
} as const;

export const macrosOnlySchema = z.object({
  nutrition: nutritionSchema,
  notes: z.string().optional(),
});

export const MACROS_ONLY_JSON_SCHEMA = {
  name: "recipe_macros",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      nutrition: NUTRITION_JSON_SCHEMA,
      notes: { type: "string" },
    },
    required: ["nutrition", "notes"],
  },
} as const;

export const substitutionsOnlySchema = z.object({
  substitutions: z.array(substitutionSchema).min(1),
});

export const SUBSTITUTIONS_ONLY_JSON_SCHEMA = {
  name: "recipe_substitutions",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      substitutions: {
        type: "array",
        items: SUBSTITUTION_JSON_SCHEMA,
      },
    },
    required: ["substitutions"],
  },
} as const;
