import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";
import { logPrivacyEvent } from "@/lib/privacy/audit";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";

const FOOD_SCANS_BUCKET = "food-scans";

async function deleteUserStorageFiles(userId: string) {
  const admin = createAdminClient();

  async function collectPaths(prefix = ""): Promise<string[]> {
    const { data, error } = await admin.storage
      .from(FOOD_SCANS_BUCKET)
      .list(prefix, { limit: 1000 });
    if (error || !data?.length) return [];

    const paths: string[] = [];
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) {
        paths.push(path);
      } else {
        paths.push(...(await collectPaths(path)));
      }
    }
    return paths;
  }

  const paths = await collectPaths(userId);
  if (paths.length === 0) return;

  const { error } = await admin.storage.from(FOOD_SCANS_BUCKET).remove(paths);
  if (error) {
    console.error("storage cleanup on account delete:", error.message);
  }
}

async function cancelActiveSubscription(userId: string) {
  if (!isStripeConfigured()) return;

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    !subscription?.stripe_subscription_id ||
    subscription.status !== "ACTIVE"
  ) {
    return;
  }

  try {
    await getStripe().subscriptions.cancel(subscription.stripe_subscription_id);
  } catch (error) {
    console.error("stripe cancel on account delete:", error);
  }
}

export async function deleteUserAccount(userId: string, email: string) {
  if (!isAdminClientConfigured()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }

  await cancelActiveSubscription(userId);
  await deleteUserStorageFiles(userId);

  await logPrivacyEvent(userId, "account_deletion", {
    email_domain: email.split("@")[1] ?? "unknown",
  });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }
}
