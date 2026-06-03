"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import {
  SHOPPING_LISTS_QUERY_KEY,
  shoppingListQueryKey,
} from "@/shared/hooks/api/query-keys";

export {
  SHOPPING_LIST_QUERY_KEY,
  SHOPPING_LISTS_QUERY_KEY,
  shoppingListQueryKey,
} from "@/shared/hooks/api/query-keys";

export function useShoppingListRealtime(listId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`shopping-list-${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `shopping_list_id=eq.${listId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: shoppingListQueryKey(listId),
          });
          queryClient.invalidateQueries({
            queryKey: [SHOPPING_LISTS_QUERY_KEY],
          });
          queryClient.invalidateQueries({ queryKey: ["home-feed"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [listId, queryClient]);
}
