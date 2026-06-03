import { siteConfig } from "@/config/site";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { getActiveStripeCustomerId } from "@/lib/billing/customer";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";

export async function POST() {
  try {
    if (!isStripeConfigured()) {
      return apiError("Billing não configurado", 503, "BILLING_NOT_CONFIGURED");
    }

    const user = await requireAuthUser();
    const customerId = await getActiveStripeCustomerId(user.id);

    if (!customerId) {
      return apiError(
        "Nenhuma assinatura ativa encontrada",
        404,
        "NO_SUBSCRIPTION",
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteConfig.url}/app/profile`,
    });

    return apiSuccess({ url: session.url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Não autenticado", 401, "UNAUTHORIZED");
    }
    const message =
      error instanceof Error ? error.message : "Erro ao abrir portal";
    return apiError(message, 500);
  }
}
