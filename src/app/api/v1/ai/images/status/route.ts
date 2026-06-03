import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import {
  GEMINI_CONFIG,
  isGeminiConfigured,
  isRecipeImageGenerationEnabled,
} from "@/lib/ai/gemini/config";

/** Status da geração de imagens — requer autenticação. */
export async function GET(request: Request) {
  try {
    await requireAuthUser(request);

    return apiSuccess({
      geminiConfigured: isGeminiConfigured(),
      recipeImagesEnabled: isRecipeImageGenerationEnabled(),
      models: {
        text: GEMINI_CONFIG.model,
        image: GEMINI_CONFIG.imageModel,
      },
      storageBucket: GEMINI_CONFIG.storageBucket,
      note: isRecipeImageGenerationEnabled()
        ? "Pronto para gerar capas após implementação do provider."
        : "Inativo — defina GEMINI_API_KEY para habilitar pós go-live.",
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/ai/images/status");
  }
}
