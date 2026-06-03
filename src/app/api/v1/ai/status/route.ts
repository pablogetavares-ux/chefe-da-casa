import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { AI_CONFIG } from "@/lib/ai/client";

import { isAiMockEnabled, isOpenAiConfigured } from "@/lib/ai/mock";

export async function GET() {
  try {
    await requireAuthUser();

    const mock = isAiMockEnabled();

    return apiSuccess({
      configured: isOpenAiConfigured() || mock,
      mock,
      model: AI_CONFIG.model,
      visionModel: AI_CONFIG.visionModel,
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/ai/status");
  }
}
