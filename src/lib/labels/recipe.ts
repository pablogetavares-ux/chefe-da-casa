import type { Database } from "@/types/database";

type RecipeDifficulty = Database["public"]["Enums"]["RecipeDifficulty"];
type DietaryPreference = Database["public"]["Enums"]["DietaryPreference"];

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
};

export const DIETARY_LABELS: Record<DietaryPreference, string> = {
  VEGETARIAN: "Vegetariano",
  VEGAN: "Vegano",
  GLUTEN_FREE: "Sem glúten",
  LACTOSE_FREE: "Sem lactose",
  LOW_CARB: "Low carb",
  KETO: "Keto",
};

export function formatDifficulty(difficulty: RecipeDifficulty) {
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

export function formatDietaryTag(tag: DietaryPreference) {
  return DIETARY_LABELS[tag] ?? tag;
}
