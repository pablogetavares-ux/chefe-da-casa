import { createStructuredCompletion } from "@/lib/ai/core/completion";
import { isAiMockEnabled } from "@/lib/ai/mock";
import { mockRefineRecipe } from "@/lib/ai/mock/recipe-tools";
import { PROMPT_TEMPLATES, recipeToPromptJson } from "@/lib/ai/prompts";
import {
  generatedRecipeSchema,
  GENERATED_RECIPE_JSON_SCHEMA,
} from "@/lib/ai/schemas/recipe-output";

export async function refineRecipeWithAI(
  recipe: {
    title: string;
    description?: string | null;
    ingredients: unknown;
    instructions: unknown;
    servings: number;
    dietary_tags?: string[];
  },
  instruction: string,
) {
  if (isAiMockEnabled()) {
    return mockRefineRecipe(recipe, instruction);
  }

  return createStructuredCompletion({
    system: PROMPT_TEMPLATES.recipeRefinement.system,
    user: PROMPT_TEMPLATES.recipeRefinement.user(
      recipeToPromptJson(recipe),
      instruction,
    ),
    schema: GENERATED_RECIPE_JSON_SCHEMA,
    zodSchema: generatedRecipeSchema,
  });
}
