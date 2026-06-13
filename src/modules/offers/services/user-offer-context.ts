import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/observability/logger";
import {
  OFFER_CATEGORY_LABELS,
  type OfferCategory,
} from "@/modules/offers/types";
import { parseOfferPreferences } from "@/modules/offers/types/offer-preferences";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type UserOfferContext = {
  plan: Database["public"]["Enums"]["PlanTier"];
  fitnessGoal: string | null;
  seniorMode: boolean;
  offerPreferences: import("@/modules/offers/types/offer-preferences").OfferPreferences;
  /** Pesos por categoria (maior = mais relevante para o perfil). */
  categoryWeights: Partial<Record<OfferCategory, number>>;
  priorityCategories: OfferCategory[];
  priorityLabels: string[];
  personalizationReason: string | null;
};

type ProfileOfferRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "plan" | "fitness_goal" | "senior_mode_enabled"
> & {
  offer_preferences?: Database["public"]["Tables"]["profiles"]["Row"]["offer_preferences"];
};

function bump(
  weights: Partial<Record<OfferCategory, number>>,
  category: OfferCategory,
  amount: number,
) {
  weights[category] = (weights[category] ?? 0) + amount;
}

export function buildUserOfferContext(
  profile: ProfileOfferRow,
): UserOfferContext {
  const weights: Partial<Record<OfferCategory, number>> = {
    PRODUCE: 1,
    PANTRY: 1,
  };

  if (profile.plan === "FAMILY") {
    bump(weights, "DAIRY", 3);
    bump(weights, "BAKERY", 2);
    bump(weights, "PRODUCE", 3);
    bump(weights, "MEAT", 2);
    bump(weights, "BEVERAGES", 2);
    bump(weights, "FROZEN", 1);
  }

  if (profile.fitness_goal === "lose_weight") {
    bump(weights, "PRODUCE", 4);
    bump(weights, "MEAT", 1);
    bump(weights, "DAIRY", 1);
    bump(weights, "BEVERAGES", 1);
  } else if (profile.fitness_goal === "gain_muscle") {
    bump(weights, "MEAT", 4);
    bump(weights, "DAIRY", 3);
    bump(weights, "PANTRY", 2);
    bump(weights, "PRODUCE", 1);
  } else if (profile.fitness_goal === "maintain") {
    bump(weights, "PRODUCE", 2);
    bump(weights, "PANTRY", 2);
    bump(weights, "MEAT", 1);
  }

  if (profile.senior_mode_enabled) {
    bump(weights, "DAIRY", 3);
    bump(weights, "BAKERY", 2);
    bump(weights, "PRODUCE", 3);
    bump(weights, "FROZEN", 1);
    bump(weights, "PANTRY", 1);
  }

  const priorityCategories = (
    Object.entries(weights) as [OfferCategory, number][]
  )
    .filter(([, weight]) => weight >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
    .slice(0, 5);

  const priorityLabels = priorityCategories.map(
    (category) => OFFER_CATEGORY_LABELS[category],
  );

  const personalizationReason = describePersonalization(
    profile,
    priorityLabels,
  );

  return {
    plan: profile.plan,
    fitnessGoal: profile.fitness_goal,
    seniorMode: profile.senior_mode_enabled,
    offerPreferences: parseOfferPreferences(profile.offer_preferences),
    categoryWeights: weights,
    priorityCategories,
    priorityLabels,
    personalizationReason,
  };
}

function describePersonalization(
  profile: ProfileOfferRow,
  labels: string[],
): string | null {
  if (labels.length === 0) return null;

  const categoryText =
    labels.length <= 3
      ? labels.join(", ")
      : `${labels.slice(0, 2).join(", ")} e mais`;

  const reasons: string[] = [];

  if (profile.plan === "FAMILY") {
    reasons.push("plano Família");
  }
  if (profile.fitness_goal === "lose_weight") {
    reasons.push("meta de emagrecimento");
  } else if (profile.fitness_goal === "gain_muscle") {
    reasons.push("meta de ganho muscular");
  } else if (profile.fitness_goal === "maintain") {
    reasons.push("manutenção do peso");
  }
  if (profile.senior_mode_enabled) {
    reasons.push("modo sênior");
  }

  if (reasons.length === 0) {
    return `Priorizamos ${categoryText} nas ofertas da sua região.`;
  }

  return `Com base no seu ${reasons.join(" e ")}, priorizamos ${categoryText}.`;
}

export async function fetchUserOfferContext(
  supabase: Client,
  userId: string,
): Promise<UserOfferContext> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, fitness_goal, senior_mode_enabled, offer_preferences")
    .eq("id", userId)
    .single();

  if (error || !data) {
    if (error) {
      logger.warn("offers.user_context.profile_fetch_failed", {
        userId,
        error: error.message,
      });
    }
    return buildUserOfferContext({
      plan: "FREE",
      fitness_goal: null,
      senior_mode_enabled: false,
      offer_preferences: {},
    });
  }

  return buildUserOfferContext(data);
}
