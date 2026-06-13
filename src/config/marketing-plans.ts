import { PLANS, type PlanId } from "@/config/plans";

/** Copy comercial por plano — preços e limites vêm de `PLANS` (fonte única com billing). */
export const PLAN_MARKETING: Record<
  PlanId,
  { tagline: string; highlight?: string; previewFeatures: number }
> = {
  free: {
    tagline: "Comece grátis com IA, despensa e ofertas de supermercado",
    previewFeatures: 4,
  },
  pro: {
    tagline: "Para quem cozinha toda semana e quer comparar preços",
    highlight: "Mais popular",
    previewFeatures: 5,
  },
  family: {
    tagline: "Para famílias que querem economia e escala no dia a dia",
    highlight: "Melhor para famílias",
    previewFeatures: 4,
  },
};

export function formatPlanPrice(planId: PlanId): string {
  const plan = PLANS[planId];
  if (plan.priceMonthly === 0) return "Grátis";
  return `R$ ${plan.priceMonthly.toFixed(2).replace(".", ",")}`;
}

export const MARKETING_PLANS_SECTION = {
  eyebrow: "Planos",
  title: "Investimento claro para a rotina da sua casa",
  description:
    "Comece no Gratuito com ofertas regionais. Evolua para Pro ou Família quando precisar de mais IA, despensa e comparador — sem surpresas na assinatura.",
  footnote:
    "Preços em reais (BRL), cobrança mensal via Stripe. Limites detalhados na página de planos.",
} as const;
