import { z } from "zod";

import { assertAiRateLimit, mapAiRouteError } from "@/lib/ai/route-utils";
import { assertAiGenerationAllowed } from "@/lib/billing/plan-limits";
import { chatWithChef } from "@/lib/ai/services/chat";
import { apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { recordUsage } from "@/lib/observability/usage";
import { logger } from "@/lib/observability/logger";

export const maxDuration = 60;

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    await assertAiRateLimit(user.id);
    await assertAiGenerationAllowed(user.id);

    const body = chatSchema.parse(await request.json());
    const result = await chatWithChef(body.messages);

    await recordUsage(user.id, "ai.chat", {
      mock: result.mock,
      messageCount: body.messages.length,
    });

    logger.info("ai.chat.completed", {
      userId: user.id,
      mock: result.mock,
    });

    return apiSuccess({
      message: {
        role: "assistant" as const,
        content: result.reply,
      },
      mock: result.mock,
    });
  } catch (error) {
    logger.warn("ai.chat.failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return mapAiRouteError(error);
  }
}
