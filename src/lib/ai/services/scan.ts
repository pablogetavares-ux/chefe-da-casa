import {
  AI_MOCK_MODEL,
  isAiMockEnabled,
  mockScanIngredients,
} from "@/lib/ai/mock";
import { createVisionStructuredCompletion } from "@/lib/ai/core/vision";
import { PROMPT_TEMPLATES } from "@/lib/ai/prompts";
import {
  scanResultSchema,
  SCAN_RESULT_JSON_SCHEMA,
  type ScanResult,
} from "@/lib/ai/schemas/scan-output";

export type ScanIngredientsResult = {
  data: ScanResult;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
};

export async function scanIngredientsFromImage(
  imageUrl: string,
  context?: string,
): Promise<ScanIngredientsResult> {
  if (isAiMockEnabled()) {
    return {
      data: mockScanIngredients(),
      model: AI_MOCK_MODEL,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: 600,
    };
  }

  const result = await createVisionStructuredCompletion({
    system: PROMPT_TEMPLATES.ingredientScan.system,
    userText: PROMPT_TEMPLATES.ingredientScan.user(context),
    imageUrl,
    schema: SCAN_RESULT_JSON_SCHEMA,
    zodSchema: scanResultSchema,
  });

  return {
    data: result.data,
    model: result.model,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    totalTokens: result.totalTokens,
    latencyMs: result.latencyMs,
  };
}

export function extractIngredientNames(scan: ScanResult): string[] {
  return [
    ...new Set(
      scan.ingredients
        .filter((item) => item.confidence !== "low")
        .map((item) => item.name.trim())
        .filter(Boolean),
    ),
  ];
}
