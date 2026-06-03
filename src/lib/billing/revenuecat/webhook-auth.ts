import { timingSafeEqual } from "node:crypto";

export function verifyRevenueCatAuthorization(
  authorizationHeader: string | null,
  secret: string,
) {
  if (!authorizationHeader || !secret) return false;
  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();

  const expected = Buffer.from(secret, "utf8");
  const received = Buffer.from(token, "utf8");

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
