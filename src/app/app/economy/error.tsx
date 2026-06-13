"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function EconomyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "economy-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro na economia alimentar"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
