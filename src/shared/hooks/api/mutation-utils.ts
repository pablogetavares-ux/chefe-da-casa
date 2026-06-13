import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  classifyClientError,
  getUserFacingMessage,
} from "@/lib/api/client-errors";

export {
  HOME_FEED_INVALIDATION,
  OFFERS_INVALIDATION,
  OFFERS_SHOPPING_INVALIDATION,
  PANTRY_INVALIDATION,
  RECIPE_AI_INVALIDATION,
  RECIPE_INVALIDATION,
  SHOPPING_INVALIDATION,
} from "@/shared/hooks/api/query-keys";

export function invalidateKeys(
  queryClient: QueryClient,
  keys: readonly QueryKey[],
) {
  for (const queryKey of keys) {
    queryClient.invalidateQueries({ queryKey });
  }
}

export function toastMutationError(error: Error) {
  const classified = classifyClientError(error);
  const message = getUserFacingMessage(error);

  if (classified.kind === "premium_required") {
    toast.error(message, {
      description: "Veja os planos Pro e Família em Meu plano.",
    });
    return;
  }

  if (classified.kind === "plan_limit") {
    toast.error(message, {
      description: "Faça upgrade ou aguarde a renovação mensal.",
    });
    return;
  }

  if (classified.kind === "billing_pending") {
    toast.error(message, {
      description: "Conclua o pagamento em Meu plano.",
    });
    return;
  }

  if (classified.kind === "network" || classified.kind === "timeout") {
    toast.error(message, {
      description: "Verifique sua conexão e tente novamente.",
    });
    return;
  }

  if (classified.kind === "ai_error" && classified.canRetry) {
    toast.error(message, {
      description: "Tente gerar novamente em alguns segundos.",
    });
    return;
  }

  toast.error(message);
}

export function toastMutationSuccess(message: string) {
  toast.success(message);
}
