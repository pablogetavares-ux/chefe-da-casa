import { createStructuredCompletion } from "@/lib/ai/core/completion";
import { isAiMockEnabled } from "@/lib/ai/mock";
import { mockRecipeMacros } from "@/lib/ai/mock/recipe-tools";
import { PROMPT_TEMPLATES, recipeToPromptJson } from "@/lib/ai/prompts";
import {
  MACROS_ONLY_JSON_SCHEMA,
  macrosOnlySchema,
} from "@/lib/ai/schemas/recipe-output";

export async function calculateMacrosWithAI(recipe: {
  title: string;
  description?: string | null;
  ingredients: unknown;
  instructions: unknown;
  servings: number;
  dietary_tags?: string[];
}) {
  if (isAiMockEnabled()) {
    return mockRecipeMacros(recipe);
  }

  const result = await createStructuredCompletion({
    system: PROMPT_TEMPLATES.macros.system,
    user: PROMPT_TEMPLATES.macros.user(recipeToPromptJson(recipe)),
    schema: MACROS_ONLY_JSON_SCHEMA,
    zodSchema: macrosOnlySchema,
    temperature: 0.3,
  });

  return result;
}
