import { checkRateLimit } from "@/lib/api/rate-limit";

const SENSITIVE_LIMIT = 5;
const SENSITIVE_WINDOW_KEY = "sensitive";

export async function assertSensitiveActionRateLimit(userId: string) {
  const result = await checkRateLimit(
    `${SENSITIVE_WINDOW_KEY}:${userId}`,
    SENSITIVE_LIMIT,
  );
  if (!result.allowed) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
}
