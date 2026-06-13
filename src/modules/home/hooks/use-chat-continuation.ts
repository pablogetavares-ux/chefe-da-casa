"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHAT_SNAPSHOT_KEY = "chef-chat-snapshot";

export type ChatSnapshot = {
  lastUserMessage: string;
  lastAssistantPreview: string;
  updatedAt: string;
};

let cachedRaw: string | null = null;
let cachedSnapshot: ChatSnapshot | null = null;

function readSnapshot(): ChatSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_SNAPSHOT_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedSnapshot = null;
      return null;
    }
    if (raw === cachedRaw) {
      return cachedSnapshot;
    }
    cachedRaw = raw;
    cachedSnapshot = JSON.parse(raw) as ChatSnapshot;
    return cachedSnapshot;
  } catch {
    cachedRaw = null;
    cachedSnapshot = null;
    return null;
  }
}

export function saveChatSnapshot(snapshot: ChatSnapshot) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(snapshot);
  sessionStorage.setItem(CHAT_SNAPSHOT_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = snapshot;
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
    cachedRaw = null;
    cachedSnapshot = null;
    window.dispatchEvent(new Event("chef-chat-updated"));
  }, []);

  return { snapshot, clear };
}

export function notifyChatUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("chef-chat-updated"));
}
