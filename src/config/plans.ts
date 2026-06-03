/**
 * Definição de planos SaaS — limites enforced em src/lib/billing/plan-limits.ts
 */
export const PLANS = {
  free: {
    id: "free",
    name: "Gratuito",
    priceMonthly: 0,
    limits: {
      recipesPerMonth: 5,
      aiGenerationsPerMonth: 10,
      savedRecipes: 10,
      pantryItems: 20,
    },
    features: [
      "5 receitas geradas por mês",
      "Despensa básica",
      "Salvar até 10 receitas",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29.9,
    limits: {
      recipesPerMonth: 100,
      aiGenerationsPerMonth: 200,
      savedRecipes: 500,
      pantryItems: 200,
    },
    features: [
      "100 receitas por mês",
      "200 gerações de IA por mês",
      "Despensa ampliada (200 itens)",
      "Receitas personalizadas por dieta",
      "Modo fitness e anti-desperdício",
    ],
  },
  family: {
    id: "family",
    name: "Família",
    priceMonthly: 49.9,
    limits: {
      recipesPerMonth: 300,
      aiGenerationsPerMonth: 600,
      savedRecipes: -1, // ilimitado
      pantryItems: -1,
    },
    features: [
      "Tudo do Pro",
      "600 gerações de IA por mês",
      "Receitas e despensa ilimitadas",
      "Suporte prioritário",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];
