import type { FitnessGoalType } from "@/lib/fitness/constants";

export type BodyProfileInput = {
  weightKg: number;
  heightCm: number;
  goal: FitnessGoalType;
};

export type FitnessTargets = {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProteinGrams: number;
  calorieTarget: number;
  proteinMinGrams: number;
};

const PROTEIN_G_PER_KG: Record<FitnessGoalType, number> = {
  lose_weight: 1.8,
  gain_muscle: 2.0,
  maintain: 1.6,
};

const MEALS_PER_DAY = 3;

/** Estimativa TDEE com Mifflin-St Jeor neutro (idade 30) e atividade leve. */
export function calculateFitnessTargets(
  input: BodyProfileInput,
): FitnessTargets {
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 125;
  const tdee = Math.round(bmr * 1.375);

  let dailyCalories: number;
  switch (input.goal) {
    case "lose_weight":
      dailyCalories = Math.max(1200, tdee - 450);
      break;
    case "gain_muscle":
      dailyCalories = tdee + 300;
      break;
    default:
      dailyCalories = tdee;
  }

  const dailyProteinGrams = Math.round(
    input.weightKg * PROTEIN_G_PER_KG[input.goal],
  );

  return {
    bmr: Math.round(bmr),
    tdee,
    dailyCalories,
    dailyProteinGrams,
    calorieTarget: Math.round(dailyCalories / MEALS_PER_DAY),
    proteinMinGrams: Math.round(dailyProteinGrams / MEALS_PER_DAY),
  };
}

export type ProfileBodyFields = {
  body_weight_kg: number | null;
  body_height_cm: number | null;
  fitness_goal: FitnessGoalType | null;
};

export function hasCompleteBodyProfile(
  profile: ProfileBodyFields | null | undefined,
): profile is ProfileBodyFields & {
  body_weight_kg: number;
  body_height_cm: number;
  fitness_goal: FitnessGoalType;
} {
  return (
    profile != null &&
    profile.body_weight_kg != null &&
    profile.body_height_cm != null &&
    profile.fitness_goal != null
  );
}
