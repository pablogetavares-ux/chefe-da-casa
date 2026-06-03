"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { captureClientException } from "@/lib/observability/monitoring-client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      digest: error.digest,
      scope: "global-error",
    });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorFallback
          title="Erro crítico"
          message="Não foi possível carregar a aplicação. Recarregue a página ou tente novamente."
          reset={reset}
        />
      </body>
    </html>
  );
}
