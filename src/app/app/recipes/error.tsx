"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "recipes-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro nas receitas"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
