import type { RecipeGenerationMode } from "@/lib/ai/constants/recipe-modes";
import {
  getModeDietaryDefaults,
  getModeRecipeTag,
} from "@/lib/ai/constants/recipe-modes";
import type { GeneratedRecipe } from "@/lib/ai/schemas/recipe-output";
import type { ScanResult } from "@/lib/ai/schemas/scan-output";
import type {
  GenerateRecipeParams,
  GenerateRecipeResult,
} from "@/lib/ai/services/generate";

import {
  detectMockRecipeProfile,
  detectSweetDessertFormat,
  mockQuantityForIngredient,
  type SweetDessertFormat,
} from "@/lib/ai/mock/recipe-profiles";

export const AI_MOCK_MODEL = "dev-mock-chefe-da-casa";

export function isAiMockEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.OPENAI_API_KEY?.trim()) return false;
  if (process.env.AI_DEV_MOCK === "false") return false;
  if (process.env.AI_DEV_MOCK === "true") return true;
  return process.env.NODE_ENV === "development";
}

export function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SWEET_FORMAT_PREFIX: Record<SweetDessertFormat, string> = {
  bolo: "Bolo de",
  pudim: "Pudim de",
  mingau: "Mingau de",
  mousse: "Mousse de",
  torta: "Torta de",
};

function titleForMode(
  mode: RecipeGenerationMode,
  main: string,
  profile: ReturnType<typeof detectMockRecipeProfile>,
  sweetFormat?: SweetDessertFormat,
) {
  if (profile === "sweet") {
    const prefix = sweetFormat ? SWEET_FORMAT_PREFIX[sweetFormat] : "Mingau de";
    return `${prefix} ${main}`;
  }

  const prefixes: Record<RecipeGenerationMode, string> = {
    STANDARD: "Receita saudável de",
    ECONOMIC: "Prato econômico de",
    FITNESS: "Bowl fitness de",
    SENIOR: "Prato leve de",
    LOW_CARB: "Low carb de",
    VEGAN: "Prato vegano de",
  };
  return `${prefixes[mode]} ${main}`;
}

function buildSweetFormatInstructions(
  ingredients: string[],
  format: SweetDessertFormat,
  isSenior: boolean,
): GeneratedRecipe["instructions"] {
  const dry = ingredients
    .filter((i) => /aveia|farinha|fuba|canela|acucar|fermento/i.test(i))
    .join(", ");
  const wet = ingredients
    .filter((i) => /banana|uva|passa|ovo|leite|mel|manga/i.test(i))
    .join(", ");
  const all = ingredients.join(", ") || "os ingredientes";

  if (format === "bolo" || format === "torta") {
    return [
      {
        step: 1,
        text: `Preaqueça o forno a ${isSenior ? "160" : "180"}°C e unte uma forma média.`,
      },
      {
        step: 2,
        text: `Misture os secos (${dry || "farinha e temperos"}) em uma tigela.`,
      },
      {
        step: 3,
        text: `Incorpore os úmidos (${wet || all}) até formar massa homogênea, sem sal.`,
      },
      {
        step: 4,
        text: `Despeje na forma e asse por ${isSenior ? "40-45" : "30-35"} minutos até firmar. Deixe esfriar antes de servir.`,
      },
    ];
  }

  if (format === "pudim" || format === "mousse") {
    return [
      {
        step: 1,
        text: `Bata ou aqueça suavemente ${all} com 1 xícara de leite vegetal ou água até ficar cremoso.`,
      },
      {
        step: 2,
        text: "Despeje em forma de pudim untada (ou potinhos individuais).",
      },
      {
        step: 3,
        text: isSenior
          ? "Cozinhe em banho-maria em fogo baixo por 45 minutos, sem deixar ferver forte."
          : "Asse em banho-maria a 180°C por 35-40 minutos, ou cozinhe em fogo baixo com tampa.",
      },
      {
        step: 4,
        text: "Deixe esfriar e leve à geladeira por pelo menos 2 horas antes de desenformar.",
      },
    ];
  }

  const liquid = ingredients.some((i) => /leite|água|agua/i.test(i))
    ? "o líquido indicado"
    : "1 xícara de água ou leite vegetal";

  return [
    {
      step: 1,
      text: `Em uma panela, aqueça ${liquid} em fogo baixo${isSenior ? " (fogo bem brando)" : ""}.`,
    },
    {
      step: 2,
      text: `Adicione ${ingredients.filter((i) => /aveia|farinha/i.test(i)).join(", ") || "a aveia ou farinha"}, mexendo até engrossar (cerca de 5 minutos).`,
    },
    {
      step: 3,
      text: `Incorpore ${ingredients.filter((i) => !/aveia|farinha|leite|água|agua/i.test(i)).join(", ") || "frutas e temperos doces"} e cozinhe mais 3 minutos.`,
    },
    {
      step: 4,
      text: "Sirva morno. Ajuste a doçura com mel ou fruta se desejar.",
    },
  ];
}

function buildMockInstructions(
  ingredients: string[],
  profile: ReturnType<typeof detectMockRecipeProfile>,
  isSenior: boolean,
  sweetFormat?: SweetDessertFormat,
): GeneratedRecipe["instructions"] {
  const list =
    ingredients.length > 0 ? ingredients.join(", ") : "os ingredientes";

  if (profile === "sweet") {
    return buildSweetFormatInstructions(
      ingredients,
      sweetFormat ?? "mingau",
      isSenior,
    );
  }

  if (profile === "mixed") {
    return [
      {
        step: 1,
        text: `Separe ingredientes doces e salgados de: ${list}. Não misture frutas doces com refogado salgado.`,
      },
      {
        step: 2,
        text: "Prepare a parte salgada: refogue aromáticos (cebola/alho) com um fio de azeite, se houver.",
      },
      {
        step: 3,
        text: "Cozinhe proteínas/legumes salgados até o ponto desejado.",
      },
      {
        step: 4,
        text: "Sirva a parte doce à parte (crua, assada ou compota) ou como sobremesa da mesma refeição.",
      },
    ];
  }

  return [
    {
      step: 1,
      text: `Prepare e lave ${ingredients[0] ?? "os ingredientes"}.`,
    },
    {
      step: 2,
      text: isSenior
        ? "Cozinhe em fogo baixo com um fio de azeite até ficar bem macio (cerca de 15 minutos)."
        : "Aqueça o azeite em uma panela média e refogue aromáticos ou o primeiro ingrediente por 3 minutos.",
    },
    {
      step: 3,
      text: `Adicione ${ingredients.slice(1).join(", ") || "os demais ingredientes"} e cozinhe até o ponto (8 a 12 minutos).`,
    },
    {
      step: 4,
      text: "Tempere com sal e pimenta a gosto. Ajuste e sirva.",
    },
  ];
}

function buildMockIngredientRows(
  ingredients: string[],
  profile: string,
  sweetFormat?: SweetDessertFormat,
) {
  const rows = ingredients.map((name) => {
    const { quantity, unit } = mockQuantityForIngredient(name);
    return { name, quantity, unit, optional: false };
  });

  if (profile === "sweet") {
    const extras =
      sweetFormat === "bolo" || sweetFormat === "torta"
        ? [
            {
              name: "Fermento em pó",
              quantity: 1,
              unit: "col. sopa",
              optional: true,
            },
          ]
        : sweetFormat === "pudim" || sweetFormat === "mousse"
          ? [
              {
                name: "Leite vegetal ou integral",
                quantity: 2,
                unit: "xícara",
                optional: true,
              },
            ]
          : [
              {
                name: "Água ou leite vegetal",
                quantity: 1,
                unit: "xícara",
                optional: true,
              },
            ];
    return [...rows, ...extras];
  }

  return [
    ...rows,
    { name: "Sal", quantity: 1, unit: "pitada", optional: true },
    { name: "Azeite", quantity: 2, unit: "col. sopa", optional: false },
  ];
}

export function mockGenerateRecipe(
  params: GenerateRecipeParams,
): GenerateRecipeResult {
  const mode = params.mode ?? "STANDARD";
  const servings = params.servings ?? 4;
  const profile = detectMockRecipeProfile(params.ingredients);
  const sweetFormat =
    profile === "sweet"
      ? detectSweetDessertFormat(params.ingredients, params.preparationStyle)
      : undefined;
  const main = params.ingredients.slice(0, 2).join(" e ") || "legumes";
  const tag = getModeRecipeTag(mode);
  const dietary = [
    ...new Set([
      ...getModeDietaryDefaults(mode),
      ...(params.dietaryPreferences ?? []),
    ]),
  ] as GeneratedRecipe["dietaryTags"];

  const isFitness = mode === "FITNESS";
  const isSenior = mode === "SENIOR";
  const isLowCarb = mode === "LOW_CARB" || mode === "FITNESS";
  const isVegan = mode === "VEGAN";

  const nutrition = {
    caloriesPerServing: isFitness
      ? 420
      : isSenior
        ? 400
        : isLowCarb
          ? 380
          : 480,
    proteinGrams: isFitness ? 32 : isSenior ? 20 : isVegan ? 18 : 24,
    carbsGrams: isLowCarb ? 18 : isSenior ? 42 : 52,
    fatGrams: isLowCarb ? 22 : isSenior ? 14 : 16,
    fiberGrams: isSenior ? 6 : 8,
  };

  const recipe: GeneratedRecipe = {
    title: titleForMode(mode, main, profile, sweetFormat),
    description: `[Modo demonstração] Rascunho local (${tag}) — formato ${profile === "sweet" ? (sweetFormat ?? "doce") : profile === "mixed" ? "misto" : "salgado"}. Configure OPENAI_API_KEY para receitas reais (bolo, pudim, etc.).`,
    ingredients: buildMockIngredientRows(
      params.ingredients,
      profile,
      sweetFormat,
    ),
    instructions: buildMockInstructions(
      params.ingredients,
      profile,
      isSenior,
      sweetFormat,
    ),
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings,
    difficulty: "EASY",
    tags: ["demonstração", tag, "mock"],
    dietaryTags: dietary.filter((d) =>
      [
        "VEGETARIAN",
        "VEGAN",
        "GLUTEN_FREE",
        "LACTOSE_FREE",
        "LOW_CARB",
        "KETO",
      ].includes(d),
    ) as GeneratedRecipe["dietaryTags"],
    nutrition,
    substitutions: params.ingredients.slice(0, 2).map((name) => ({
      original: name,
      substitute: `${name} orgânico`,
      reason: "Alternativa mais acessível no mercado local.",
    })),
    costTier: mode === "ECONOMIC" ? "LOW" : "MEDIUM",
    estimatedCostPerServing: mode === "ECONOMIC" ? 6.5 : 12,
  };

  return {
    recipe,
    model: AI_MOCK_MODEL,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs: 800,
  };
}

export async function mockGenerateRecipeStream(
  params: GenerateRecipeParams,
  onDelta?: (text: string) => void,
): Promise<GenerateRecipeResult> {
  const result = mockGenerateRecipe(params);
  const json = JSON.stringify(result.recipe);
  const chunkSize = 48;

  for (let i = chunkSize; i <= json.length; i += chunkSize) {
    onDelta?.(json.slice(0, i));
    await delay(40);
  }
  onDelta?.(json);

  return result;
}

export function mockScanIngredients(): ScanResult {
  return {
    ingredients: [
      {
        name: "tomate",
        confidence: "high",
        quantityEstimate: "3 unidades",
        category: "hortifruti",
      },
      {
        name: "cebola",
        confidence: "high",
        quantityEstimate: "2 unidades",
        category: "hortifruti",
      },
      {
        name: "ovos",
        confidence: "medium",
        quantityEstimate: "1 dúzia",
        category: "proteína",
      },
      {
        name: "arroz",
        confidence: "medium",
        quantityEstimate: "meio pacote",
        category: "grão",
      },
    ],
    sceneDescription:
      "[Modo demonstração] Ingredientes de exemplo detectados. Com OPENAI_API_KEY, a visão IA analisa sua foto real.",
    suggestions: [
      "Configure OPENAI_API_KEY para reconhecimento real por foto.",
      "Use boa iluminação ao fotografar a despensa.",
    ],
  };
}
