"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "admin-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro no painel admin"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
