import { createStructuredCompletion } from "@/lib/ai/core/completion";
import { isAiMockEnabled } from "@/lib/ai/mock";
import { mockAdaptRecipe } from "@/lib/ai/mock/recipe-tools";
import { PROMPT_TEMPLATES, recipeToPromptJson } from "@/lib/ai/prompts";
import {
  generatedRecipeSchema,
  GENERATED_RECIPE_JSON_SCHEMA,
} from "@/lib/ai/schemas/recipe-output";

export async function adaptRecipeWithAI(
  recipe: {
    title: string;
    description?: string | null;
    ingredients: unknown;
    instructions: unknown;
    servings: number;
    dietary_tags?: string[];
  },
  targetDiet: string,
  instruction?: string,
) {
  if (isAiMockEnabled()) {
    return mockAdaptRecipe(recipe, targetDiet, instruction);
  }

  const result = await createStructuredCompletion({
    system: PROMPT_TEMPLATES.recipeAdaptation.system,
    user: PROMPT_TEMPLATES.recipeAdaptation.user(
      recipeToPromptJson(recipe),
      targetDiet,
      instruction,
    ),
    schema: GENERATED_RECIPE_JSON_SCHEMA,
    zodSchema: generatedRecipeSchema,
  });

  return result;
}
