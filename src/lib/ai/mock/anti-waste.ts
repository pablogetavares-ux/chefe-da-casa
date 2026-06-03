import { AI_MOCK_MODEL } from "@/lib/ai/mock";
import type {
  AntiWasteGenerateParams,
  AntiWasteGenerateResult,
} from "@/lib/ai/services/anti-waste";
import type { AntiWasteRecipe } from "@/lib/ai/schemas/anti-waste-output";

export function mockAntiWasteRecipe(
  params: AntiWasteGenerateParams,
): AntiWasteGenerateResult {
  const servings = params.servings ?? 4;
  const names = params.priorityItems.map((i) => i.name);
  const main = names.slice(0, 2).join(" e ") || "sobras da despensa";

  const recipe: AntiWasteRecipe = {
    title: `Reaproveitamento inteligente: ${main}`,
    description: `[Modo demonstração] Receita anti-desperdício usando ${names.join(", ")}. Configure OPENAI_API_KEY para sugestões reais com IA.`,
    ingredients: [
      ...names.map((name, index) => ({
        name,
        quantity: index === 0 ? 2 : 1,
        unit: index === 0 ? "porção" : "xícara",
        optional: false,
      })),
      { name: "Sal", quantity: 1, unit: "pitada", optional: true },
      { name: "Azeite", quantity: 1, unit: "col. sopa", optional: false },
    ],
    instructions: [
      {
        step: 1,
        text: `Revise ${names[0] ?? "os ingredientes"} — descarte apenas o que estiver impróprio.`,
      },
      {
        step: 2,
        text: "Aqueça uma frigideira com azeite e combine os itens prioritários.",
      },
      {
        step: 3,
        text: "Tempere e cozinhe até integrar sabores (8–12 min).",
      },
      {
        step: 4,
        text: "Sirva imediatamente ou congele porções para evitar novo desperdício.",
      },
    ],
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings,
    difficulty: "EASY",
    tags: ["demonstração", "anti-desperdício", "mock"],
    dietaryTags: [],
    nutrition: {
      caloriesPerServing: 390,
      proteinGrams: 18,
      carbsGrams: 42,
      fatGrams: 14,
      fiberGrams: 6,
    },
    substitutions: names.slice(0, 2).map((name) => ({
      original: name,
      substitute: `Versão congelada de ${name}`,
      reason: "Congele sobras similares para usar em sopas ou recheios.",
    })),
    costTier: "LOW",
    estimatedCostPerServing: 4.5,
    prioritizedIngredients: names,
    wasteReductionTips: [
      "Consuma primeiro itens com validade mais próxima (FIFO).",
      "Congele porções individuais em potes herméticos.",
      "Transforme sobras em omeletes, tortas ou caldos no dia seguinte.",
    ],
    repurposingIdeas: [
      "Sobras de arroz → bolinhos ou salada fria.",
      "Legumes amolecendo → sopa ou purê assado.",
      "Proteína cozida → recheio de wrap ou bowl.",
    ],
  };

  return {
    recipe,
    model: AI_MOCK_MODEL,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs: 900,
  };
}
