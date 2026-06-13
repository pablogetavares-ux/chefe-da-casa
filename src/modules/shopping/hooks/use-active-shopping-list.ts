"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "chef-active-shopping-list";

function readStoredListId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(STORAGE_KEY) ?? undefined;
}

const activeListListeners = new Set<() => void>();

function subscribeActiveList(callback: () => void) {
  activeListListeners.add(callback);
  return () => {
    activeListListeners.delete(callback);
  };
}

function notifyActiveListChange() {
  for (const listener of activeListListeners) {
    listener();
  }
}

export function useActiveShoppingListId(fallbackId?: string) {
  const storedId = useSyncExternalStore(
    subscribeActiveList,
    readStoredListId,
    () => undefined,
  );
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const setActiveListId = useCallback((listId: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, listId);
      notifyActiveListChange();
    }
  }, []);

  const activeListId = hydrated ? (storedId ?? fallbackId) : fallbackId;

  return { activeListId, setActiveListId, hydrated };
}
