"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorFallbackProps = {
  title?: string;
  message?: string;
  reset?: () => void;
  compact?: boolean;
};

export function ErrorFallback({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.",
  reset,
  compact = false,
}: ErrorFallbackProps) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          : "flex min-h-[50vh] flex-col items-center justify-center px-4 text-center"
      }
      role="alert"
    >
      <div
        className={
          compact
            ? "flex items-start gap-3 text-left"
            : "flex max-w-md flex-col items-center"
        }
      >
        <AlertTriangle
          className={
            compact
              ? "mt-0.5 size-5 shrink-0 text-destructive"
              : "mb-4 size-12 text-destructive/80"
          }
          aria-hidden
        />
        <div>
          <h2
            className={
              compact
                ? "text-sm font-medium text-destructive"
                : "font-heading text-xl font-semibold"
            }
          >
            {title}
          </h2>
          <p
            className={
              compact
                ? "mt-1 text-sm text-muted-foreground"
                : "mt-2 text-sm text-muted-foreground"
            }
          >
            {message}
          </p>
          {reset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={compact ? "mt-3 gap-2" : "mt-6 gap-2"}
              onClick={reset}
            >
              <RefreshCw className="size-4" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
