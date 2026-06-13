"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function WeeklyPlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "weekly-plan-error",
    });
  }, [error]);

  return (
    <ErrorFallback
      title="Erro no cardápio semanal"
      message={error.message || undefined}
      reset={reset}
    />
  );
}
