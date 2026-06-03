export type RecipeInstruction = {
  step: number;
  text: string;
};

const MIN_STEP_SECONDS = 6;
const MAX_STEP_SECONDS = 45;

export function parseInstructions(raw: unknown): RecipeInstruction[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item): item is RecipeInstruction =>
        typeof item === "object" &&
        item !== null &&
        "step" in item &&
        "text" in item &&
        typeof (item as RecipeInstruction).step === "number" &&
        typeof (item as RecipeInstruction).text === "string" &&
        (item as RecipeInstruction).text.trim().length > 0,
    )
    .sort((a, b) => a.step - b.step);
}

/**
 * Distribui o tempo total de preparo entre os passos.
 * Primeiros ~35% dos passos recebem prep; o restante recebe cozimento.
 */
export function estimateStepDurations(
  instructions: RecipeInstruction[],
  prepTimeMinutes: number,
  cookTimeMinutes: number,
): number[] {
  const count = instructions.length;
  if (count === 0) return [];

  const totalSeconds = Math.max(
    (prepTimeMinutes + cookTimeMinutes) * 60,
    count * MIN_STEP_SECONDS,
  );

  const prepStepCount = Math.max(1, Math.round(count * 0.35));
  const prepPool =
    prepTimeMinutes > 0
      ? prepTimeMinutes * 60
      : totalSeconds * (prepStepCount / count);
  const cookPool =
    cookTimeMinutes > 0 ? cookTimeMinutes * 60 : totalSeconds - prepPool;

  const prepPerStep = prepPool / prepStepCount;
  const cookPerStep = cookPool / Math.max(1, count - prepStepCount);

  return instructions.map((_, index) => {
    const raw = index < prepStepCount ? prepPerStep : cookPerStep;
    return Math.round(
      Math.min(MAX_STEP_SECONDS, Math.max(MIN_STEP_SECONDS, raw)),
    );
  });
}

export function totalStepReelSeconds(durations: number[]): number {
  return durations.reduce((sum, value) => sum + value, 0);
}
