import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const supabase = await createClient();
  const stripe = getStripe();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  return customer.id;
}

export async function getActiveStripeCustomerId(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", userId)
    .in("status", ["ACTIVE", "TRIALING", "PAST_DUE"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.stripe_customer_id ?? null;
}
