/**
 * Templates de prompts para geração e refinamento de receitas.
 */
import type { RecipeGenerationMode } from "@/lib/ai/constants/recipe-modes";
import type { FitnessGoalType } from "@/lib/fitness/constants";
import { FITNESS_GOAL_LABELS } from "@/lib/fitness/constants";

export type { RecipeGenerationMode };

export type FitnessGoals = {
  calorieTarget?: number;
  proteinMinGrams?: number;
  bodyWeightKg?: number;
  bodyHeightCm?: number;
  physicalGoal?: FitnessGoalType;
  dailyCalories?: number;
  dailyProteinGrams?: number;
};

const MODE_INSTRUCTIONS: Record<RecipeGenerationMode, string> = {
  STANDARD:
    "Crie uma receita equilibrada, saudável e saborosa para o dia a dia. Priorize ingredientes naturais e preparo simples.",
  ECONOMIC:
    "Priorize ingredientes baratos, acessíveis e comuns no Brasil. Minimize itens premium. costTier deve ser LOW quando possível. Estime estimatedCostPerServing em reais (BRL).",
  FITNESS:
    "Priorize alto valor proteico, macros transparentes e preparo fitness-friendly. Ajuste porções para metas de calorias e proteína informadas. Proteína por porção deve ser destacada.",
  SENIOR:
    "Modo idoso: receitas simples, nutritivas e fáceis de mastigar. Priorize texturas macias (cozido, assado mole, purês, cremes, sopas). Evite alimentos duros, crocantes, muito fibrosos ou picantes. Poucos passos, linguagem clara. difficulty preferencialmente EASY. Inclua proteína de fácil digestão e vegetais bem cozidos quando possível.",
  LOW_CARB:
    "Receita low carb: máximo 20g carboidratos por porção. Evite arroz, massas, pães, açúcar e tubérculos amiláceos. Priorize proteínas, vegetais e gorduras saudáveis. dietaryTags deve incluir LOW_CARB.",
  VEGAN:
    "Receita 100% vegana: sem carne, peixe, ovos, leite, queijo, mel ou qualquer derivado animal. Use proteínas vegetais (grão-de-bico, tofu, lentilha). dietaryTags deve incluir VEGAN.",
};

export const PROMPT_TEMPLATES = {
  recipeGeneration: {
    system: (
      mode: RecipeGenerationMode = "STANDARD",
    ) => `Você é o Chefe da Casa, assistente culinário brasileiro especializado em receitas saudáveis, práticas e saborosas.

Regras:
- Use preferencialmente os ingredientes informados pelo usuário.
- Coerência culinária: escolha o formato mais adequado aos ingredientes — por exemplo bolo, pudim, torta, mousse, brigadeiro, mingau, panqueca, vitamina, refogado, assado, grelhado ou sopa. O título deve refletir o formato (ex.: "Bolo de banana", "Pudim de leite").
- Se o usuário pedir um formato específico (bolo, pudim, etc.), siga-o e descreva passos típicos desse preparo (forma, forno, banho-maria, geladeira, tempo de coação).
- Não refogue frutas doces (banana, uva, maçã) com sal, pimenta e azeite como prato salgado.
- Pode sugerir temperos básicos (sal, pimenta, azeite) apenas em preparos salgados; em receitas doces use canela, mel ou limão quando fizer sentido.
- Todo ingrediente listado deve aparecer nos passos; quantidades realistas (ex.: canela em colher de chá, não xícara).
- Responda SEMPRE em português do Brasil.
- Instruções claras, numeradas e objetivas.
- Tempos em minutos (inteiros).
- difficulty: EASY (até 30 min total), MEDIUM (31-60 min), HARD (61+ min).
- Estime nutrition por porção com valores realistas: caloriesPerServing (kcal), proteinGrams, carbsGrams, fatGrams, fiberGrams.
- Inclua substitutions úteis (2 a 5) para ingredientes menos comuns ou restrições.
- Modo atual: ${mode}. ${MODE_INSTRUCTIONS[mode]}`,
    user: (
      ingredients: string[],
      options: {
        preferences?: string;
        servings?: number;
        maxPrepTimeMinutes?: number;
        mode?: RecipeGenerationMode;
        fitnessGoals?: FitnessGoals;
        preparationStyle?: string;
      } = {},
    ) => {
      const {
        preferences,
        servings = 4,
        maxPrepTimeMinutes,
        mode = "STANDARD",
        fitnessGoals,
        preparationStyle,
      } = options;

      const parts = [
        `Ingredientes disponíveis: ${ingredients.join(", ")}.`,
        `Porções: ${servings}.`,
        `Modo de receita: ${mode}.`,
      ];

      if (preferences) {
        parts.push(`Preferências dietéticas adicionais: ${preferences}.`);
      }

      if (preparationStyle) {
        parts.push(
          `Formato de preparo desejado: ${preparationStyle}. Monte a receita nesse formato com passos adequados.`,
        );
      } else {
        parts.push(
          "Formato de preparo: escolha o mais coerente (bolo, pudim, torta, mingau, refogado, etc.) com base nos ingredientes.",
        );
      }

      if (maxPrepTimeMinutes) {
        parts.push(
          `Tempo máximo de preparo (prep + cozimento): ${maxPrepTimeMinutes} minutos.`,
        );
      }

      if (mode === "FITNESS" && fitnessGoals) {
        if (fitnessGoals.bodyWeightKg && fitnessGoals.bodyHeightCm) {
          const goalLabel = fitnessGoals.physicalGoal
            ? FITNESS_GOAL_LABELS[fitnessGoals.physicalGoal].label
            : "equilíbrio";
          parts.push(
            `Perfil físico: ${fitnessGoals.bodyWeightKg} kg, ${fitnessGoals.bodyHeightCm} cm, objetivo "${goalLabel}".`,
          );
          parts.push(
            "Adapte proteínas, calorias e quantidades dos ingredientes para esse perfil.",
          );
        }
        if (fitnessGoals.dailyCalories) {
          parts.push(
            `Meta calórica diária estimada: ~${fitnessGoals.dailyCalories} kcal.`,
          );
        }
        if (fitnessGoals.dailyProteinGrams) {
          parts.push(
            `Proteína diária estimada: ~${fitnessGoals.dailyProteinGrams} g.`,
          );
        }
        if (fitnessGoals.calorieTarget) {
          parts.push(
            `Meta calórica por porção (refeição): ~${fitnessGoals.calorieTarget} kcal.`,
          );
        }
        if (fitnessGoals.proteinMinGrams) {
          parts.push(
            `Proteína mínima por porção: ${fitnessGoals.proteinMinGrams} g.`,
          );
        }
      }

      if (mode === "LOW_CARB") {
        parts.push(
          "Carboidratos por porção devem ficar abaixo de 20g. Evite açúcar e farinhas refinadas.",
        );
      }

      if (mode === "VEGAN") {
        parts.push(
          "Não use nenhum ingrediente de origem animal. Confirme que todos os ingredientes são plant-based.",
        );
      }

      if (mode === "SENIOR") {
        parts.push(
          "Textura macia e fácil de mastigar. Preparo simples com poucos passos. Nutrição equilibrada para idosos (proteína, fibras, cálcio quando possível). Evite frituras duras e temperos fortes.",
        );
      }

      parts.push(
        "Retorne receita completa com macros detalhados (calorias, proteínas, carboidratos, gorduras, fibras), substituições e custo.",
      );

      return parts.join(" ");
    },
  },
  ingredientScan: {
    system: `Você é um especialista em visão computacional culinária para o mercado brasileiro.
Analise fotos de despensa, geladeira, bancada ou pratos e identifique alimentos/ingredientes visíveis.

Regras:
- Nomes em português do Brasil (ex: "tomate", "frango", "arroz").
- confidence: high (claramente visível), medium (provável), low (incerto).
- quantityEstimate: estimativa textual quando possível (ex: "2 unidades", "meio pacote").
- category: hortifruti, proteína, laticínio, grão, tempero, etc.
- sceneDescription: descreva brevemente o que vê na imagem.
- suggestions: dicas úteis (ex: "ingredientes parecem próximos do vencimento").
- Não invente ingredientes ocultos; liste apenas o visível ou claramente inferível.`,
    user: (context?: string) =>
      context
        ? `Contexto adicional: ${context}\n\nIdentifique todos os ingredientes alimentares visíveis nesta imagem.`
        : "Identifique todos os ingredientes alimentares visíveis nesta imagem.",
  },
  recipeAdaptation: {
    system: `Você adapta receitas existentes para novas restrições dietéticas ou objetivos, mantendo sabor e viabilidade doméstica. Responda em português do Brasil com receita completa revisada incluindo macros.`,
    user: (recipeJson: string, targetDiet: string, instruction?: string) =>
      [
        `Receita atual (JSON):\n${recipeJson}`,
        `Adaptar para: ${targetDiet}.`,
        instruction ? `Instrução extra: ${instruction}` : "",
        "Atualize ingredientes, passos, macros (calorias, proteínas, carboidratos, gorduras), substituições e tags dietéticas.",
      ]
        .filter(Boolean)
        .join("\n\n"),
  },
  substitutions: {
    system: `Você sugere substituições culinárias práticas no contexto brasileiro. Responda em português.`,
    user: (recipeJson: string, reason?: string) =>
      [
        `Receita:\n${recipeJson}`,
        reason
          ? `Motivo/missing: ${reason}`
          : "Sugira substituições úteis para ingredientes menos acessíveis.",
      ].join("\n\n"),
  },
  macros: {
    system: `Você calcula macros nutricionais estimados por porção para receitas domésticas brasileiras. Valores realistas em kcal e gramas (proteínas, carboidratos, gorduras, fibras).`,
    user: (recipeJson: string) =>
      `Estime os macros por porção desta receita (calorias, proteínas, carboidratos, gorduras, fibras):\n${recipeJson}`,
  },
  recipeRefinement: {
    system: `Você refina receitas existentes conforme instrução do usuário, mantendo sabor e viabilidade doméstica. Responda em português do Brasil. Retorne receita completa revisada com macros, substituições e custo.`,
    user: (recipe: string, instruction: string) =>
      `Receita atual:\n${recipe}\n\nInstrução de refinamento: ${instruction}\n\nAtualize título, ingredientes, passos, macros e substituições conforme necessário.`,
  },
} as const;

export function recipeToPromptJson(recipe: {
  title: string;
  description?: string | null;
  ingredients: unknown;
  instructions: unknown;
  servings: number;
  dietary_tags?: string[];
}) {
  return JSON.stringify(
    {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      servings: recipe.servings,
      dietaryTags: recipe.dietary_tags ?? [],
    },
    null,
    2,
  );
}
