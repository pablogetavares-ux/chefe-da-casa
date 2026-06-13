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
      "Ofertas regionais (supermercados)",
      "Lista de compras com promoções",
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
      "Ofertas priorizadas por perfil fitness",
      "Comparador de preços avançado",
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
      "Ofertas com prioridade familiar",
      "Suporte prioritário",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

/** Rótulo amigável para enum/tier vindo do banco (FREE, pro, etc.). */
export function formatPlanDisplayName(plan: string): string {
  const key = planTierToPlanId(plan);
  return PLANS[key]?.name ?? plan;
}

/** Converte tier do perfil (FREE, PRO, FAMILY) para id de marketing. */
export function planTierToPlanId(plan: string): PlanId {
  const key = plan.trim().toLowerCase() as PlanId;
  return key in PLANS ? key : "free";
}

/** Converte id de marketing para tier persistido no perfil. */
export function planIdToTier(planId: PlanId): "FREE" | "PRO" | "FAMILY" {
  if (planId === "pro") return "PRO";
  if (planId === "family") return "FAMILY";
  return "FREE";
}

const BRAZIL_TZ = "America/Sao_Paulo";

/** Período do dia no fuso BR — usar no servidor para evitar hydration mismatch. */
export function getDayPeriodInBrazil(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: BRAZIL_TZ,
    }).format(now),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
