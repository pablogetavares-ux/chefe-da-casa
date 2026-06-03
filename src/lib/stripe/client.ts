import Stripe from "stripe";

import { env } from "@/config/env";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não configurada");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}
