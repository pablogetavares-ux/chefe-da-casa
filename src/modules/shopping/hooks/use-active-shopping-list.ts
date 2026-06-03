"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "chef-active-shopping-list";

function readStoredListId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(STORAGE_KEY) ?? undefined;
}

export function useActiveShoppingListId(fallbackId?: string) {
  const [storedId, setStoredId] = useState<string | undefined>(
    readStoredListId,
  );

  const setActiveListId = useCallback((listId: string) => {
    setStoredId(listId);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, listId);
    }
  }, []);

  return { activeListId: storedId ?? fallbackId, setActiveListId };
}
