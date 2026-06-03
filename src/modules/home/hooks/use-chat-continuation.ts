"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHAT_SNAPSHOT_KEY = "chef-chat-snapshot";

export type ChatSnapshot = {
  lastUserMessage: string;
  lastAssistantPreview: string;
  updatedAt: string;
};

function readSnapshot(): ChatSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChatSnapshot;
  } catch {
    return null;
  }
}

export function saveChatSnapshot(snapshot: ChatSnapshot) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAT_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function useChatContinuation() {
  const snapshot = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener("chef-chat-updated", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("chef-chat-updated", handler);
      };
    },
    readSnapshot,
    () => null,
  );

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(CHAT_SNAPSHOT_KEY);
    window.dispatchEvent(new Event("chef-chat-updated"));
  }, []);

  return { snapshot, clear };
}

export function notifyChatUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("chef-chat-updated"));
}
