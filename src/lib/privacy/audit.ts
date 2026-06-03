import type { Json } from "@/types/database";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";

export type PrivacyEventType = "data_export" | "account_deletion";

export async function logPrivacyEvent(
  userId: string,
  eventType: PrivacyEventType,
  metadata?: Record<string, unknown>,
) {
  if (!isAdminClientConfigured()) return;

  const admin = createAdminClient();
  await admin.from("account_privacy_events").insert({
    user_id: userId,
    event_type: eventType,
    metadata: (metadata ?? null) as Json | null,
  });
}
