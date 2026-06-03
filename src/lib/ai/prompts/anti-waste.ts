import type { AntiWastePantryItem } from "@/lib/queries/anti-waste";
import { formatPantryItemForPrompt } from "@/lib/queries/anti-waste";

export const ANTI_WASTE_PROMPTS = {
  system: `Você é o Chef da Casa AI em modo "Evite Desperdício", especialista em reaproveitamento de alimentos no Brasil.

Regras:
- PRIORIZE ingredientes vencendo, vencidos (com segurança alimentar) e sobras informadas.
- Para itens vencidos: sugira transformações seguras (cozimento prolongado, sopas, molhos, congelamento imediato) e alerte quando descartar.
- Para sobras: proponha receitas de reaproveitamento criativo (omeletes, tortas, saladas, recheios, bowls).
- Use o MÁXIMO possível dos itens prioritários antes de sugerir compras.
- Pode usar temperos básicos (sal, pimenta, azeite, alho, cebola).
- Responda em português do Brasil.
- Inclua wasteReductionTips práticas e repurposingIdeas para sobras futuras.
- prioritizedIngredients: liste os itens que a receita consome prioritariamente.
- costTier preferencialmente LOW (economia e sustentabilidade).
- difficulty preferencialmente EASY ou MEDIUM.`,

  user: (
    items: AntiWastePantryItem[],
    options: {
      servings?: number;
      maxPrepTimeMinutes?: number;
      extraNotes?: string;
      supplementalIngredients?: string[];
    } = {},
  ) => {
    const {
      servings = 4,
      maxPrepTimeMinutes,
      extraNotes,
      supplementalIngredients,
    } = options;

    const lines = items.map(formatPantryItemForPrompt);

    const parts = [
      "Itens para reaproveitar (prioridade decrescente):",
      ...lines.map((line, i) => `${i + 1}. ${line}`),
      `Porções desejadas: ${servings}.`,
    ];

    if (supplementalIngredients?.length) {
      parts.push(
        `Ingredientes extras disponíveis na despensa: ${supplementalIngredients.join(", ")}.`,
      );
    }

    if (maxPrepTimeMinutes) {
      parts.push(`Tempo máximo total: ${maxPrepTimeMinutes} minutos.`);
    }

    if (extraNotes?.trim()) {
      parts.push(`Observações do usuário: ${extraNotes.trim()}`);
    }

    parts.push(
      "Gere UMA receita completa que reduza desperdício, com dicas de conservação e ideias de reaproveitamento.",
    );

    return parts.join("\n");
  },
} as const;
