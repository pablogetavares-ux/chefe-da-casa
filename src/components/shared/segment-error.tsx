"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

type SegmentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  scope: string;
  title?: string;
};

export function SegmentError({
  error,
  reset,
  scope,
  title,
}: SegmentErrorProps) {
  useEffect(() => {
    captureClientException(error, { digest: error.digest, scope });
  }, [error, scope]);

  return (
    <ErrorFallback
      title={title}
      message={error.message || undefined}
      reset={reset}
    />
  );
}
