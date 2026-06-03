import { z } from "zod";

function toFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

/** Evita falha quando o client envia `null` (JSON.stringify(NaN)). */
export function coerceOptionalInt(min: number, max: number) {
  return z.preprocess((val) => {
    const n = toFiniteNumber(val);
    if (n === undefined) return undefined;
    return Math.round(n);
  }, z.number().int().min(min).max(max).optional());
}

export function coerceServings(defaultValue = 4) {
  return z.preprocess((val) => {
    const n = toFiniteNumber(val);
    if (n === undefined) return defaultValue;
    return Math.round(n);
  }, z.number().int().min(1).max(12));
}

export const fitnessGoalsRequestSchema = z
  .object({
    calorieTarget: coerceOptionalInt(200, 1500),
    proteinMinGrams: coerceOptionalInt(10, 120),
  })
  .transform((goals) => {
    const hasValues =
      goals.calorieTarget !== undefined || goals.proteinMinGrams !== undefined;
    return hasValues ? goals : undefined;
  });
