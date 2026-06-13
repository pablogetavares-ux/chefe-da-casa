import { headers } from "next/headers";

import { apiError, apiSuccess } from "@/lib/api/response";
import {
  isRevenueCatWebhookProcessed,
  markRevenueCatWebhookProcessed,
} from "@/lib/billing/revenuecat/audit";
import { isRevenueCatWebhookConfigured } from "@/lib/billing/revenuecat/config";
import {
  handleRevenueCatWebhook,
  verifyRevenueCatAuthorization,
} from "@/lib/billing/revenuecat/webhook-handler";
import { env } from "@/config/env";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { logger } from "@/lib/observability/logger";

export async function POST(request: Request) {
  if (!isRevenueCatWebhookConfigured() || !isAdminClientConfigured()) {
    return apiError(
      "RevenueCat não configurado",
      503,
      "BILLING_NOT_CONFIGURED",
    );
  }

  const authorization = (await headers()).get("authorization");
  const secret = env.REVENUECAT_WEBHOOK_SECRET!;

  if (!verifyRevenueCatAuthorization(authorization, secret)) {
    return apiError("Assinatura inválida", 401, "INVALID_WEBHOOK_AUTH");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("JSON inválido", 400);
  }

  const event = (body as { event?: { id?: string; type?: string } }).event;
  const eventId = event?.id ?? `anon-${Date.now()}`;

  if (await isRevenueCatWebhookProcessed(eventId)) {
    logger.info("revenuecat.webhook.duplicate", { eventId });
    return apiSuccess({ received: true, duplicate: true });
  }

  try {
    const result = await handleRevenueCatWebhook(
      body as Parameters<typeof handleRevenueCatWebhook>[0],
    );

    if (!result.ok) {
      logger.error("revenuecat.webhook.skipped", {
        eventId,
        reason: result.reason,
      });
      return apiError(
        "Evento ignorado — app_user_id ausente",
        422,
        "WEBHOOK_SKIPPED",
      );
    }

    await markRevenueCatWebhookProcessed(eventId, event?.type ?? "UNKNOWN");
    return apiSuccess({ received: true, ...result });
  } catch (error) {
    logger.error("revenuecat.webhook.failed", {
      eventId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return apiError("Falha ao processar webhook", 500);
  }
}
