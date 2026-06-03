import { describe, expect, it } from "vitest";

import {
  selectEconomicalRecipes,
  selectRecipesOfTheDay,
} from "@/modules/home/utils/recipe-selection";
import type { Recipe } from "@/types/database";

function recipe(
  id: string,
  difficulty: Recipe["difficulty"],
  minutes: number,
): Recipe {
  return {
    id,
    title: `Receita ${id}`,
    description: null,
    ingredients: [],
    instructions: [],
    prep_time_minutes: minutes,
    cook_time_minutes: 0,
    servings: 2,
    difficulty,
    dietary_tags: [],
    tags: [],
    is_ai_generated: false,
    cover_image_url: null,
    ai_prompt_snapshot: null,
    user_id: "user-1",
    created_at: "",
    updated_at: "",
  };
}

describe("selectRecipesOfTheDay", () => {
  it("retorna no máximo 3 receitas de forma determinística", () => {
    const pool = ["a", "b", "c", "d", "e"].map((id) => recipe(id, "EASY", 10));
    const first = selectRecipesOfTheDay(pool, 3);
    const second = selectRecipesOfTheDay(pool, 3);
    expect(first).toHaveLength(3);
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
  });
});

describe("selectEconomicalRecipes", () => {
  it("prioriza receitas fáceis e rápidas", () => {
    const pool = Array.from({ length: 6 }, (_, index) =>
      recipe(`r${index}`, index % 2 === 0 ? "HARD" : "EASY", 10 + index * 5),
    );

    const selected = selectEconomicalRecipes(pool, 2);

    expect(selected.length).toBe(2);
    expect(selected.every((item) => item.difficulty === "EASY")).toBe(true);
  });
});
