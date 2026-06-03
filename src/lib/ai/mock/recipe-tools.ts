import type { GeneratedRecipe } from "@/lib/ai/schemas/recipe-output";
import type { StructuredCompletionResult } from "@/lib/ai/core/completion";

import { AI_MOCK_MODEL, delay } from "./index";

type RecipeInput = {
  title: string;
  description?: string | null;
  ingredients: unknown;
  instructions: unknown;
  servings: number;
  dietary_tags?: string[];
};

function parseIngredients(raw: unknown): GeneratedRecipe["ingredients"] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        name: "Ingrediente principal",
        quantity: 1,
        unit: "un",
        optional: false,
      },
    ];
  }

  return raw
    .filter(
      (
        item,
      ): item is {
        name: string;
        quantity?: number;
        unit?: string;
        optional?: boolean;
      } =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        typeof (item as { name: string }).name === "string",
    )
    .map((item) => ({
      name: item.name,
      quantity: item.quantity ?? 1,
      unit: item.unit ?? "un",
      optional: item.optional ?? false,
    }));
}

function parseInstructions(raw: unknown): GeneratedRecipe["instructions"] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      { step: 1, text: "Prepare os ingredientes." },
      { step: 2, text: "Cozinhe conforme a receita original e sirva." },
    ];
  }

  return raw
    .filter(
      (item): item is { step: number; text: string } =>
        typeof item === "object" &&
        item !== null &&
        "step" in item &&
        "text" in item,
    )
    .sort((a, b) => a.step - b.step);
}

function baseMockRecipe(recipe: RecipeInput): GeneratedRecipe {
  const ingredients = parseIngredients(recipe.ingredients);

  return {
    title: recipe.title,
    description:
      recipe.description ??
      "[Modo demonstração] Receita simulada localmente. Configure OPENAI_API_KEY para IA real.",
    ingredients,
    instructions: parseInstructions(recipe.instructions),
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: recipe.servings,
    difficulty: "EASY",
    tags: ["demonstração", "mock"],
    dietaryTags: (recipe.dietary_tags ?? []) as GeneratedRecipe["dietaryTags"],
    nutrition: {
      caloriesPerServing: 450,
      proteinGrams: 22,
      carbsGrams: 48,
      fatGrams: 18,
      fiberGrams: 6,
    },
    substitutions: ingredients.slice(0, 2).map((item) => ({
      original: item.name,
      substitute: `${item.name} (alternativa)`,
      reason: "Substituição sugerida no modo demonstração.",
    })),
    costTier: "MEDIUM",
    estimatedCostPerServing: 10,
  };
}

function mockCompletion<T>(data: T): StructuredCompletionResult<T> {
  return {
    data,
    model: AI_MOCK_MODEL,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs: 700,
    raw: JSON.stringify(data),
  };
}

export async function mockAdaptRecipe(
  recipe: RecipeInput,
  targetDiet: string,
  instruction?: string,
): Promise<StructuredCompletionResult<GeneratedRecipe>> {
  await delay(700);

  const data = baseMockRecipe(recipe);
  data.title = `${recipe.title} — ${targetDiet}`;
  data.description = `[Modo demonstração] Versão adaptada para ${targetDiet}.${instruction ? ` ${instruction}` : ""}`;
  data.tags = [...data.tags, "adaptado"];

  return mockCompletion(data);
}

export async function mockRefineRecipe(
  recipe: RecipeInput,
  instruction: string,
): Promise<StructuredCompletionResult<GeneratedRecipe>> {
  await delay(700);

  const data = baseMockRecipe(recipe);
  data.title = `${recipe.title} (refinada)`;
  data.description = `[Modo demonstração] Refinamento simulado: ${instruction}`;
  data.tags = [...data.tags, "refinada"];

  return mockCompletion(data);
}

export async function mockRecipeMacros(recipe: RecipeInput) {
  await delay(500);

  return mockCompletion({
    nutrition: baseMockRecipe(recipe).nutrition,
    notes: `[Modo demonstração] Macros estimados para "${recipe.title}".`,
  });
}

export async function mockRecipeSubstitutions(
  recipe: RecipeInput,
  reason?: string,
) {
  await delay(500);

  const ingredients = parseIngredients(recipe.ingredients);

  return mockCompletion({
    substitutions: ingredients.slice(0, 3).map((item) => ({
      original: item.name,
      substitute: reason
        ? `Alternativa para ${reason}`
        : `${item.name} (versão econômica)`,
      reason:
        reason ??
        "Substituição sugerida no modo demonstração para ingredientes comuns.",
    })),
  });
}
