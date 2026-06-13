import { z } from "zod";

import { publicEnv } from "@/config/public-env";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Chefe da Casa"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_VISION_MODEL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  GEMINI_IMAGE_MODEL: z.string().optional(),
  RECIPE_IMAGES_ENABLED: z.enum(["true", "false"]).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_FAMILY: z.string().optional(),
  REVENUECAT_SECRET_KEY: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),
  REVENUECAT_ENTITLEMENT_PREMIUM: z.string().default("premium"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  AI_DEV_MOCK: z.enum(["true", "false"]).optional(),
  BILLING_DEV_MOCK: z.enum(["true", "false"]).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  return envSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DATABASE_URL: process.env.DATABASE_URL || undefined,
    DIRECT_URL: process.env.DIRECT_URL || undefined,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_VISION_MODEL: process.env.OPENAI_VISION_MODEL || undefined,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || undefined,
    GEMINI_MODEL: process.env.GEMINI_MODEL || undefined,
    GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || undefined,
    RECIPE_IMAGES_ENABLED: process.env.RECIPE_IMAGES_ENABLED as
      | "true"
      | "false"
      | undefined,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || undefined,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || undefined,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || undefined,
    STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO || undefined,
    STRIPE_PRICE_FAMILY: process.env.STRIPE_PRICE_FAMILY || undefined,
    REVENUECAT_SECRET_KEY: process.env.REVENUECAT_SECRET_KEY || undefined,
    REVENUECAT_WEBHOOK_SECRET:
      process.env.REVENUECAT_WEBHOOK_SECRET || undefined,
    REVENUECAT_ENTITLEMENT_PREMIUM:
      process.env.REVENUECAT_ENTITLEMENT_PREMIUM || "premium",
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || undefined,
    AI_DEV_MOCK: process.env.AI_DEV_MOCK as "true" | "false" | undefined,
    BILLING_DEV_MOCK: process.env.BILLING_DEV_MOCK as
      | "true"
      | "false"
      | undefined,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || undefined,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
    SENTRY_DSN: process.env.SENTRY_DSN || undefined,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  });
}

/** Variáveis de ambiente validadas — usar no servidor. */
export const env = getEnv();

export { publicEnv };
