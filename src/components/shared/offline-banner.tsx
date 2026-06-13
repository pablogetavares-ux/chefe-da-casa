"use client";

import { WifiOff } from "lucide-react";

import { useNetworkStatus } from "@/shared/hooks/use-network-status";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-950 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <WifiOff className="size-4 shrink-0" aria-hidden />
        <p>
          Você está offline. Algumas ações ficam indisponíveis até a conexão
          voltar.
        </p>
      </div>
    </div>
  );
}
