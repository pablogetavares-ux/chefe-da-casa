import { describe, expect, it } from "vitest";

import { consolidateIngredientsFromRecipes } from "@/lib/shopping/consolidate-ingredients";

describe("consolidateIngredientsFromRecipes", () => {
  it("agrupa e soma o mesmo ingrediente entre receitas", () => {
    const result = consolidateIngredientsFromRecipes([
      {
        id: "r1",
        title: "Salada",
        ingredients: [
          { name: "Tomate", quantity: 500, unit: "g" },
          { name: "Cebola", quantity: 1, unit: "un" },
        ],
      },
      {
        id: "r2",
        title: "Molho",
        ingredients: [
          { name: "tomate", quantity: 0.5, unit: "kg" },
          { name: "Cebola", quantity: 2, unit: "un" },
        ],
      },
    ]);

    const tomate = result.items.find((i) =>
      i.name.toLowerCase().includes("tomate"),
    );
    expect(tomate?.quantity).toBe(1);
    expect(tomate?.unit).toBe("kg");
    expect(tomate?.recipeIds).toHaveLength(2);

    const cebola = result.items.find((i) =>
      i.name.toLowerCase().includes("cebola"),
    );
    expect(cebola?.quantity).toBe(3);
    expect(cebola?.unit).toBe("un");
  });

  it("ordena por categoria (hortifruti antes de mercearia)", () => {
    const result = consolidateIngredientsFromRecipes([
      {
        id: "r1",
        title: "Prato",
        ingredients: [
          { name: "Arroz", quantity: 1, unit: "kg" },
          { name: "Tomate", quantity: 2, unit: "un" },
        ],
      },
    ]);

    expect(result.items[0]?.category).toBe("HORTIFRUTI");
    expect(result.items[1]?.category).toBe("MERCEARIA");
  });
});
