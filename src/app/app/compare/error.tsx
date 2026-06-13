"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "compare-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro ao comparar mercados"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
