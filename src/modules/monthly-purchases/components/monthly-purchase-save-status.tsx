"use client";

import { Check, Cloud, Loader2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type MonthlyPurchaseSaveStatusProps = {
  status: SaveStatus;
  className?: string;
};

export function MonthlyPurchaseSaveStatus({
  status,
  className,
}: MonthlyPurchaseSaveStatusProps) {
  if (status === "idle") return null;

  const config = {
    pending: {
      icon: Cloud,
      text: "Alterações detectadas…",
      className: "text-muted-foreground",
    },
    saving: {
      icon: Loader2,
      text: "Salvando automaticamente…",
      className: "text-primary",
    },
    saved: {
      icon: Check,
      text: "Salvo",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    error: {
      icon: AlertCircle,
      text: "Erro ao salvar — tente de novo",
      className: "text-destructive",
    },
  }[status];

  const Icon = config.icon;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        config.className,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn("size-3.5", status === "saving" && "animate-spin")} />
      {config.text}
    </p>
  );
}
