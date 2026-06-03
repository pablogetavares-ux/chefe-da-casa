/**
 * Planos do app mobile (RevenueCat + Google Play).
 * Premium mapeia para tier PRO no Supabase (mesmos limites do plano Pro web).
 */
export const MOBILE_PLANS = {
  free: {
    id: "free",
    name: "Gratuito",
    entitlementId: null,
    features: ["5 receitas por mês", "10 gerações de IA", "Despensa básica"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    entitlementId: "premium",
    productIds: {
      android: "chefe_premium_monthly",
      ios: "chefe_premium_monthly",
    },
    trialDays: 7,
    features: [
      "100 receitas por mês",
      "200 gerações de IA",
      "Modo fitness e anti-desperdício",
      "Comparador de preços",
      "Suporte prioritário",
    ],
  },
} as const;

export type MobilePlanId = keyof typeof MOBILE_PLANS;
