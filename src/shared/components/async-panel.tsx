"use client";

import type { ReactNode } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import {
  classifyClientError,
  getUserFacingMessage,
} from "@/lib/api/client-errors";

type AsyncPanelProps = {
  isLoading: boolean;
  error: Error | null;
  loadingFallback?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
};

export function AsyncPanel({
  isLoading,
  error,
  loadingFallback,
  onRetry,
  children,
}: AsyncPanelProps) {
  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    );
  }

  if (error) {
    const classified = classifyClientError(error);

    return (
      <ErrorFallback
        compact
        title={errorTitleForKind(classified.kind)}
        message={getUserFacingMessage(error)}
        reset={classified.canRetry ? onRetry : undefined}
      />
    );
  }

  return children;
}

function errorTitleForKind(
  kind: ReturnType<typeof classifyClientError>["kind"],
) {
  switch (kind) {
    case "network":
      return "Sem conexão";
    case "timeout":
      return "Tempo esgotado";
    case "premium_required":
      return "Recurso premium";
    case "plan_limit":
      return "Limite do plano";
    case "ai_error":
      return "Falha na IA";
    case "billing_pending":
      return "Pagamento pendente";
    default:
      return "Não foi possível carregar";
  }
}
