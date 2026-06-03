import type { Recipe } from "@/types/database";

/** Seleção determinística por dia — mesmas receitas durante o dia. */
export function selectRecipesOfTheDay(recipes: Recipe[], count = 3): Recipe[] {
  if (recipes.length <= count) return recipes;

  const seed = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return [...recipes]
    .sort((a, b) => {
      const scoreA = (hash ^ a.id.charCodeAt(0)) >>> 0;
      const scoreB = (hash ^ b.id.charCodeAt(0)) >>> 0;
      return scoreA - scoreB;
    })
    .slice(0, count);
}

/** Receitas rápidas e fáceis — perfil “econômico” no MVP. */
export function selectEconomicalRecipes(
  recipes: Recipe[],
  count = 3,
): Recipe[] {
  if (recipes.length === 0) return [];

  const ranked = [...recipes].sort((a, b) => {
    const difficultyScore = (d: Recipe["difficulty"]) =>
      d === "EASY" ? 0 : d === "MEDIUM" ? 1 : 2;
    const diff = difficultyScore(a.difficulty) - difficultyScore(b.difficulty);
    if (diff !== 0) return diff;
    const timeA = a.prep_time_minutes + a.cook_time_minutes;
    const timeB = b.prep_time_minutes + b.cook_time_minutes;
    return timeA - timeB;
  });

  const dailyIds = new Set(
    selectRecipesOfTheDay(recipes, count).map((recipe) => recipe.id),
  );

  return ranked.filter((recipe) => !dailyIds.has(recipe.id)).slice(0, count);
}
