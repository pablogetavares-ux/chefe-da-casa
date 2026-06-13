import { isPremiumTier } from "@/lib/billing/premium";
import type { Subscription } from "@/types/database";

export type BillingDisplayState =
  | "none"
  | "active"
  | "trialing"
  | "incomplete"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "plan_mismatch";

export type BillingHealth = {
  state: BillingDisplayState;
  title: string;
  message: string;
  recoverable: boolean;
  blocksPremiumFeatures: boolean;
};

const ACTIVE_STATUSES = new Set(["ACTIVE", "TRIALING"]);

export function deriveBillingHealth(
  plan: string,
  subscription: Subscription | null | undefined,
): BillingHealth {
  const premiumPlan = isPremiumTier(plan);
  const status = subscription?.status;

  if (!subscription) {
    if (premiumPlan) {
      return {
        state: "plan_mismatch",
        title: "Assinatura não encontrada",
        message:
          "Seu plano premium ainda não foi confirmado. Aguarde alguns segundos ou atualize a página.",
        recoverable: true,
        blocksPremiumFeatures: false,
      };
    }

    return {
      state: "none",
      title: "",
      message: "",
      recoverable: false,
      blocksPremiumFeatures: false,
    };
  }

  switch (status) {
    case "INCOMPLETE":
      return {
        state: "incomplete",
        title: "Pagamento pendente",
        message:
          "Conclua o checkout para ativar seu plano. Se já pagou, aguarde a confirmação ou tente sincronizar.",
        recoverable: true,
        blocksPremiumFeatures: !premiumPlan,
      };
    case "PAST_DUE":
      return {
        state: "past_due",
        title: "Pagamento em atraso",
        message:
          "Atualize a forma de pagamento no portal para manter o acesso premium.",
        recoverable: true,
        blocksPremiumFeatures: false,
      };
    case "UNPAID":
      return {
        state: "unpaid",
        title: "Assinatura suspensa",
        message: "Regularize o pagamento para restaurar recursos premium.",
        recoverable: true,
        blocksPremiumFeatures: true,
      };
    case "CANCELED":
      if (premiumPlan) {
        return {
          state: "plan_mismatch",
          title: "Plano desatualizado",
          message:
            "Sua assinatura foi cancelada, mas o plano ainda aparece como premium. Sincronize ou aguarde a atualização.",
          recoverable: true,
          blocksPremiumFeatures: false,
        };
      }
      return {
        state: "canceled",
        title: "Assinatura cancelada",
        message: "Renove quando quiser voltar ao plano pago.",
        recoverable: true,
        blocksPremiumFeatures: false,
      };
    case "TRIALING":
      return {
        state: "trialing",
        title: "",
        message: "",
        recoverable: false,
        blocksPremiumFeatures: false,
      };
    case "ACTIVE":
      if (!premiumPlan) {
        return {
          state: "plan_mismatch",
          title: "Sincronizando plano",
          message:
            "Pagamento confirmado — estamos atualizando seu acesso premium.",
          recoverable: true,
          blocksPremiumFeatures: false,
        };
      }
      return {
        state: "active",
        title: "",
        message: "",
        recoverable: false,
        blocksPremiumFeatures: false,
      };
    default:
      if (status && !ACTIVE_STATUSES.has(status) && premiumPlan) {
        return {
          state: "plan_mismatch",
          title: "Status da assinatura",
          message: `Assinatura em estado ${status}. Verifique em Meu plano.`,
          recoverable: true,
          blocksPremiumFeatures: false,
        };
      }

      return {
        state: "none",
        title: "",
        message: "",
        recoverable: false,
        blocksPremiumFeatures: false,
      };
  }
}

export function shouldShowBillingBanner(health: BillingHealth): boolean {
  return Boolean(health.title && health.message);
}
