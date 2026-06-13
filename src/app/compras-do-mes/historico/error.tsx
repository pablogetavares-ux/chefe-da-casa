"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function ComprasDoMesHistoricoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "compras-do-mes-historico-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro no histórico de compras"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
