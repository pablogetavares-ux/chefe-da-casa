export const ENTITLEMENT_PREMIUM = "premium";
export const OFFERING_ID = "default";
export const PACKAGE_PREMIUM_MONTHLY = "$rc_monthly";

export const MOBILE_PLAN_FEATURES = {
  free: ["5 receitas por mês", "10 gerações de IA", "Despensa básica"],
  premium: [
    "100 receitas por mês",
    "200 gerações de IA",
    "Modo fitness e anti-desperdício",
    "Comparador de preços",
    "Teste grátis de 7 dias",
  ],
} as const;

export const BILLING_ERROR_MESSAGES: Record<string, string> = {
  PURCHASE_CANCELLED: "Compra cancelada.",
  STORE_PROBLEM: "Problema na Google Play. Tente novamente.",
  NETWORK_ERROR: "Sem conexão. Verifique a internet.",
  NOT_CONFIGURED: "Pagamentos não configurados neste build.",
  UNAUTHORIZED: "Faça login para assinar.",
  default: "Não foi possível concluir a operação.",
};
