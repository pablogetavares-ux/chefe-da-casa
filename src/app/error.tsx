"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

function useCaptureError(error: Error & { digest?: string }, scope: string) {
  useEffect(() => {
    captureClientException(error, { digest: error.digest, scope });
  }, [error, scope]);
}

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useCaptureError(error, "root-error");

  return <ErrorFallback message={error.message || undefined} reset={reset} />;
}
