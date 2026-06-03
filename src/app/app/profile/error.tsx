"use client";

import { SegmentError } from "@/components/shared/segment-error";

export default function ProfileError({
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
      scope="profile-error"
      title="Erro no perfil"
    />
  );
}
