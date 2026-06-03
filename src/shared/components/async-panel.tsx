"use client";

import type { ReactNode } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { Skeleton } from "@/components/ui/skeleton";

type AsyncPanelProps = {
  isLoading: boolean;
  error: Error | null;
  loadingFallback?: ReactNode;
  children: ReactNode;
};

export function AsyncPanel({
  isLoading,
  error,
  loadingFallback,
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
    return (
      <ErrorFallback
        compact
        title="Não foi possível carregar"
        message={error.message}
      />
    );
  }

  return children;
}
