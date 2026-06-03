import { siteConfig } from "@/config/site";
import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { isBillingMockEnabled } from "@/lib/billing/mock";
import { mockUpgradePlan } from "@/lib/billing/mock-upgrade";
import { getOrCreateStripeCustomer } from "@/lib/billing/customer";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { planTierFromPlanId, stripePriceIdForPlan } from "@/lib/stripe/config";
import { billingCheckoutSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = billingCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Plano inválido", 400);
    }

    if (isBillingMockEnabled()) {
      await mockUpgradePlan(user.id, parsed.data.planId);
      return apiSuccess({
        url: `${siteConfig.url}/app/profile?billing=mock-success`,
        mock: true,
      });
    }

    if (!isStripeConfigured()) {
      return apiError("Billing não configurado", 503, "BILLING_NOT_CONFIGURED");
    }

    const priceId = stripePriceIdForPlan(parsed.data.planId);
    if (!priceId) {
      return apiError(
        "Preço Stripe não configurado para este plano",
        503,
        "PRICE_NOT_CONFIGURED",
      );
    }

    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomer(
      user.id,
      user.email ?? "",
    );

    const planTier = planTierFromPlanId(parsed.data.planId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteConfig.url}/app/profile?billing=success`,
      cancel_url: `${siteConfig.url}/app/profile?billing=canceled`,
      metadata: {
        userId: user.id,
        plan: planTier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: planTier,
        },
      },
    });

    if (!session.url) {
      return apiError("Erro ao criar checkout", 500);
    }

    return apiSuccess({ url: session.url });
  } catch (error) {
    return handleApiRouteError(error, "POST /api/v1/billing/checkout");
  }
}
