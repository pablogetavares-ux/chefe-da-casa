import { createStructuredCompletion } from "@/lib/ai/core/completion";
import { isAiMockEnabled } from "@/lib/ai/mock";
import { mockRecipeSubstitutions } from "@/lib/ai/mock/recipe-tools";
import { PROMPT_TEMPLATES, recipeToPromptJson } from "@/lib/ai/prompts";
import {
  SUBSTITUTIONS_ONLY_JSON_SCHEMA,
  substitutionsOnlySchema,
} from "@/lib/ai/schemas/recipe-output";

export async function suggestSubstitutionsWithAI(
  recipe: {
    title: string;
    description?: string | null;
    ingredients: unknown;
    instructions: unknown;
    servings: number;
    dietary_tags?: string[];
  },
  reason?: string,
) {
  if (isAiMockEnabled()) {
    return mockRecipeSubstitutions(recipe, reason);
  }

  const result = await createStructuredCompletion({
    system: PROMPT_TEMPLATES.substitutions.system,
    user: PROMPT_TEMPLATES.substitutions.user(
      recipeToPromptJson(recipe),
      reason,
    ),
    schema: SUBSTITUTIONS_ONLY_JSON_SCHEMA,
    zodSchema: substitutionsOnlySchema,
  });

  return result;
}
