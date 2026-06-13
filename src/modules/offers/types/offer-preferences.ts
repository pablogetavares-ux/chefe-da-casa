import { z } from "zod";

import { isOfferHubVerticalSlug } from "@/modules/offers/services/catalog";

/** Preferências persistidas em `profiles.offer_preferences`. */
export const offerPreferencesSchema = z
  .object({
    favoriteVerticalSlugs: z.array(z.string().min(1).max(40)).max(7).optional(),
    hideRoadmapHints: z.boolean().optional(),
    emailOfferDigest: z.boolean().optional(),
  })
  .strict();

export type OfferPreferences = z.infer<typeof offerPreferencesSchema>;

export function parseOfferPreferences(raw: unknown): OfferPreferences {
  const parsed = offerPreferencesSchema.safeParse(raw);
  if (!parsed.success) return {};
  const favoriteVerticalSlugs = parsed.data.favoriteVerticalSlugs?.filter(
    (slug) => isOfferHubVerticalSlug(slug),
  );
  return {
    ...parsed.data,
    ...(favoriteVerticalSlugs !== undefined ? { favoriteVerticalSlugs } : {}),
  };
}

export function mergeOfferPreferences(
  current: unknown,
  patch: OfferPreferences,
): OfferPreferences {
  return offerPreferencesSchema.parse({
    ...parseOfferPreferences(current),
    ...patch,
  });
}
