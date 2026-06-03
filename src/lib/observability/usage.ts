import { insertUsageLog } from "@/lib/supabase/service-records";

export async function recordUsage(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  await insertUsageLog(userId, action, metadata);
}
