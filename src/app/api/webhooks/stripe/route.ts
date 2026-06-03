import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { env } from "@/config/env";
import {
  isStripeWebhookProcessed,
  markStripeWebhookProcessed,
} from "@/lib/billing/audit";
import {
  downgradeUserToFree,
  syncSubscriptionFromStripe,
} from "@/lib/billing/sync";
import { logger } from "@/lib/observability/logger";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isAdminClientConfigured()) {
    return NextResponse.json(
      { error: "Webhook não configurado" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (await isStripeWebhookProcessed(event.id)) {
    logger.info("stripe.webhook.duplicate", { eventId: event.id });
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          String(session.subscription),
        );

        await syncSubscriptionFromStripe(
          subscription,
          session.client_reference_id ?? session.metadata?.userId,
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const admin = createAdminClient();
          await admin
            .from("subscriptions")
            .update({
              status: "CANCELED",
              canceled_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);
          await downgradeUserToFree(userId, "stripe.subscription.deleted");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const subscriptionRef = invoice.subscription;
        const subscriptionId =
          typeof subscriptionRef === "string"
            ? subscriptionRef
            : subscriptionRef?.id;

        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscriptionFromStripe(subscription);
          logger.warn("stripe.invoice.payment_failed", {
            subscriptionId,
            customerId: invoice.customer,
          });
        }
        break;
      }

      default:
        break;
    }

    await markStripeWebhookProcessed(event.id, event.type);
    logger.info("stripe.webhook.processed", {
      eventId: event.id,
      type: event.type,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao processar webhook";
    logger.error("stripe.webhook.failed", {
      eventId: event.id,
      type: event.type,
      message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
