import type { FitnessTargets } from "@/lib/fitness/calculate-targets";

export type FitnessGoalsRequest = {
  calorieTarget?: number;
  proteinMinGrams?: number;
};

/** Monta metas fitness sem enviar NaN/null no JSON (modo FITNESS sem perfil completo). */
export function buildFitnessGoalsRequest(
  calorieTargetInput: string,
  proteinMinInput: string,
  fromProfile: Pick<FitnessTargets, "calorieTarget" | "proteinMinGrams"> | null,
): FitnessGoalsRequest | undefined {
  const goals: FitnessGoalsRequest = {};

  const ct = toFiniteNumber(calorieTargetInput || fromProfile?.calorieTarget);
  const pg = toFiniteNumber(proteinMinInput || fromProfile?.proteinMinGrams);

  if (ct !== undefined && ct >= 200 && ct <= 1500) {
    goals.calorieTarget = Math.round(ct);
  }
  if (pg !== undefined && pg >= 10 && pg <= 120) {
    goals.proteinMinGrams = Math.round(pg);
  }

  return goals.calorieTarget !== undefined ||
    goals.proteinMinGrams !== undefined
    ? goals
    : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n;
}
