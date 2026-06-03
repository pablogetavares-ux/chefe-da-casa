import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

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
  toast.error(error.message);
}

export function toastMutationSuccess(message: string) {
  toast.success(message);
}
