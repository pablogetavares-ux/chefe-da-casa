"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useNetworkStatus } from "@/shared/hooks/use-network-status";

export function NetworkRecoveryListener() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) return;

    void queryClient.refetchQueries({
      type: "active",
      stale: true,
    });
  }, [isOnline, queryClient]);

  useEffect(() => {
    function handleOnline() {
      toast.success("Conexão restabelecida", {
        description: "Atualizando seus dados…",
      });
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
