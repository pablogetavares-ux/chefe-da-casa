import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { isRevenueCatConfigured } from "@/lib/billing/revenuecat/config";
import { syncMobileSubscriptionForUser } from "@/lib/billing/revenuecat/sync";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);

    if (!isRevenueCatConfigured() || !isAdminClientConfigured()) {
      return apiError(
        "Billing mobile não configurado",
        503,
        "BILLING_NOT_CONFIGURED",
      );
    }

    const result = await syncMobileSubscriptionForUser(user.id, {
      eventType: "CLIENT_SYNC",
    });

    if (!result.ok) {
      return apiError(
        "Assinatura não encontrada no RevenueCat",
        404,
        "SUBSCRIBER_NOT_FOUND",
      );
    }

    return apiSuccess({
      plan: result.plan,
      isPremium: result.isPremium,
      status: result.status,
      isTrial: result.isTrial,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Não autenticado", 401, "UNAUTHORIZED");
    }
    const message =
      error instanceof Error ? error.message : "Erro ao sincronizar assinatura";
    return apiError(message, 500);
  }
}
