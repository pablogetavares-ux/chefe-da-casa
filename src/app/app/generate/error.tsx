"use client";

import { SegmentError } from "@/components/shared/segment-error";

export default function GenerateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentError
      error={error}
      reset={reset}
      scope="generate-error"
      title="Erro ao gerar receita"
    />
  );
}
