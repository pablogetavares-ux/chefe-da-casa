"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function RecipeDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "recipe-detail-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro ao carregar receita"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
