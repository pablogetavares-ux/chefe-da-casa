"use client";

import { SegmentError } from "@/components/shared/segment-error";

export default function ChatError({
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
      scope="chat-error"
      title="Erro no chat"
    />
  );
}
