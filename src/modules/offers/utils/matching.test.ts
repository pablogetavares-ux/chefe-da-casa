import { describe, expect, it } from "vitest";

import {
  extractRecipeIngredientNames,
  extractRecipeIngredientTerms,
  getOfferMatchedIngredients,
  normalizeOfferText,
  scoreOfferForRecipe,
} from "@/modules/offers/utils/matching";
import type { Recipe } from "@/types/database";

const baseRecipe = {
  id: "r1",
  user_id: "u1",
  title: "Receita saudável de tomate e ovo",
  description: null,
  ingredients: [
    { name: "tomate", quantity: 2, unit: "un", optional: false },
    { name: "ovo", quantity: 1, unit: "un", optional: false },
  ],
  instructions: [],
  prep_time_minutes: 10,
  cook_time_minutes: 10,
  servings: 2,
  difficulty: "EASY" as const,
  tags: [],
  dietary_tags: [],
  is_ai_generated: false,
  ai_prompt_snapshot: null,
  cover_image_url: null,
  created_at: "",
  updated_at: "",
} satisfies Recipe;

describe("offer matching", () => {
  it("normaliza acentos", () => {
    expect(normalizeOfferText("Salmão")).toBe("salmao");
  });

  it("extrai termos de ingredientes", () => {
    const terms = extractRecipeIngredientTerms(baseRecipe);
    expect(terms).toContain("tomate");
    expect(terms).toContain("ovo");
  });

  it("extrai nomes legíveis de ingredientes", () => {
    const names = extractRecipeIngredientNames(baseRecipe);
    expect(names).toContain("tomate");
    expect(names).toContain("ovo");
  });

  it("lista ingredientes que batem na oferta", () => {
    const offer = {
      id: "o1",
      store_id: "s1",
      title: "Tomate italiano",
      description: null,
      category: "PRODUCE" as const,
      category_id: null,
      product_name: "Tomate italiano",
      current_price: 5.99,
      previous_price: 8.99,
      unit: "kg",
      valid_from: "",
      valid_until: "",
      image_url: null,
      ingredient_keywords: ["tomate", "tomate italiano"],
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    expect(getOfferMatchedIngredients(offer, ["tomate", "ovo"])).toEqual([
      "tomate",
    ]);
  });

  it("pontua oferta compatível com tomate", () => {
    const score = scoreOfferForRecipe(
      {
        id: "o1",
        store_id: "s1",
        title: "Tomate italiano",
        description: null,
        category: "PRODUCE",
        category_id: null,
        product_name: "Tomate italiano",
        current_price: 5.99,
        previous_price: 8.99,
        unit: "kg",
        valid_from: "",
        valid_until: "",
        image_url: null,
        ingredient_keywords: ["tomate", "tomate italiano"],
        is_active: true,
        created_at: "",
        updated_at: "",
      },
      extractRecipeIngredientTerms(baseRecipe),
    );

    expect(score).toBeGreaterThan(0);
  });

  it("nao confunde macarrao com arroz", () => {
    const score = scoreOfferForRecipe(
      {
        id: "o2",
        store_id: "s1",
        title: "Arroz branco 5kg",
        description: null,
        category: "PANTRY",
        category_id: null,
        product_name: "Arroz branco",
        current_price: 22.9,
        previous_price: 27.9,
        unit: "pacote",
        valid_from: "",
        valid_until: "",
        image_url: null,
        ingredient_keywords: ["arroz", "arroz branco"],
        is_active: true,
        created_at: "",
        updated_at: "",
      },
      ["macarrao"],
    );

    expect(score).toBe(0);
  });
});
