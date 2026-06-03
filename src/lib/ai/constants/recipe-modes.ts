export const RECIPE_GENERATION_MODES = [
  "STANDARD",
  "ECONOMIC",
  "FITNESS",
  "SENIOR",
  "LOW_CARB",
  "VEGAN",
] as const;

export type RecipeGenerationMode = (typeof RECIPE_GENERATION_MODES)[number];

export const RECIPE_MODE_LABELS: Record<
  RecipeGenerationMode,
  { label: string; description: string }
> = {
  STANDARD: {
    label: "Saudável",
    description: "Equilíbrio nutricional do dia a dia",
  },
  ECONOMIC: {
    label: "Econômica",
    description: "Ingredientes baratos e acessíveis",
  },
  FITNESS: {
    label: "Fitness",
    description: "Alto proteico, macros transparentes",
  },
  SENIOR: {
    label: "Modo idoso",
    description: "Simples, macio e nutritivo",
  },
  LOW_CARB: {
    label: "Low carb",
    description: "Baixo carboidrato, mais proteína e gorduras boas",
  },
  VEGAN: {
    label: "Vegana",
    description: "100% plant-based, sem derivados animais",
  },
};

export function getModeRecipeTag(mode: RecipeGenerationMode): string {
  const tags: Record<RecipeGenerationMode, string> = {
    STANDARD: "saudável",
    ECONOMIC: "econômica",
    FITNESS: "fitness",
    SENIOR: "modo idoso",
    LOW_CARB: "low carb",
    VEGAN: "vegana",
  };
  return tags[mode];
}

export function getModeDietaryDefaults(mode: RecipeGenerationMode): string[] {
  if (mode === "VEGAN") return ["VEGAN"];
  if (mode === "LOW_CARB") return ["LOW_CARB"];
  return [];
}
