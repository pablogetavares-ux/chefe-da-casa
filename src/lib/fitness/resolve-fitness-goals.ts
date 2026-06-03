import type { FitnessGoals } from "@/lib/ai/prompts";
import {
  calculateFitnessTargets,
  hasCompleteBodyProfile,
  type ProfileBodyFields,
} from "@/lib/fitness/calculate-targets";
import type { GenerateRecipeInput } from "@/lib/validations";

export function resolveFitnessGoals(
  mode: GenerateRecipeInput["mode"],
  profile: ProfileBodyFields | null | undefined,
  requestGoals?: GenerateRecipeInput["fitnessGoals"],
): FitnessGoals | undefined {
  if (mode !== "FITNESS") return undefined;

  const fromProfile = hasCompleteBodyProfile(profile)
    ? calculateFitnessTargets({
        weightKg: Number(profile.body_weight_kg),
        heightCm: Number(profile.body_height_cm),
        goal: profile.fitness_goal,
      })
    : null;

  if (!fromProfile && !requestGoals) return undefined;

  const resolved: FitnessGoals = {
    bodyWeightKg: hasCompleteBodyProfile(profile)
      ? Number(profile.body_weight_kg)
      : undefined,
    bodyHeightCm: hasCompleteBodyProfile(profile)
      ? Number(profile.body_height_cm)
      : undefined,
    physicalGoal: hasCompleteBodyProfile(profile)
      ? profile.fitness_goal
      : undefined,
    dailyCalories: fromProfile?.dailyCalories,
    dailyProteinGrams: fromProfile?.dailyProteinGrams,
    calorieTarget: requestGoals?.calorieTarget ?? fromProfile?.calorieTarget,
    proteinMinGrams:
      requestGoals?.proteinMinGrams ?? fromProfile?.proteinMinGrams,
  };

  return resolved;
}

export function enrichGenerateRecipeInput<
  T extends Pick<GenerateRecipeInput, "mode" | "fitnessGoals">,
>(input: T, profile: ProfileBodyFields | null | undefined): T {
  const fitnessGoals = resolveFitnessGoals(
    input.mode,
    profile,
    input.fitnessGoals,
  );

  if (!fitnessGoals) return input;

  return { ...input, fitnessGoals };
}
