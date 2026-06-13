"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function OffersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "offers-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro na Central de Ofertas"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
