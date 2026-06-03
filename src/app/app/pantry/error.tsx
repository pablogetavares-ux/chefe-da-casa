"use client";

import { SegmentError } from "@/components/shared/segment-error";

export default function PantryError({
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
      scope="pantry-error"
      title="Erro na despensa"
    />
  );
}
