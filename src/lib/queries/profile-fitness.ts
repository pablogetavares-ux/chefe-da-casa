import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileBodyFields } from "@/lib/fitness/calculate-targets";
import type { FitnessGoalType } from "@/lib/fitness/constants";
import type { Database } from "@/types/database";

function normalizeProfileBodyFields(
  data: {
    body_weight_kg: number | null;
    body_height_cm: number | null;
    fitness_goal: string | null;
  } | null,
): ProfileBodyFields | null {
  if (!data) return null;

  const goal = data.fitness_goal;
  const fitnessGoal =
    goal === "lose_weight" || goal === "gain_muscle" || goal === "maintain"
      ? (goal as FitnessGoalType)
      : null;

  return {
    body_weight_kg: data.body_weight_kg,
    body_height_cm: data.body_height_cm,
    fitness_goal: fitnessGoal,
  };
}

export async function getProfileBodyFields(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("body_weight_kg, body_height_cm, fitness_goal")
    .eq("id", userId)
    .single();

  return normalizeProfileBodyFields(data);
}
