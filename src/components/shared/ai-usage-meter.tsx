"use client";

import Link from "next/link";

import { useAiUsage } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

type AiUsageMeterProps = {
  compact?: boolean;
  className?: string;
};

export function AiUsageMeter({
  compact = false,
  className,
}: AiUsageMeterProps) {
  const { data: usage, isLoading } = useAiUsage();

  if (isLoading || !usage) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-lg bg-muted",
          compact ? "h-2 w-full" : "h-10",
          className,
        )}
        aria-hidden
      />
    );
  }

  const percent =
    usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const isLow = usage.remaining <= Math.ceil(usage.limit * 0.2);

  if (compact) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>IA este mês</span>
          <span>
            {usage.used}/{usage.limit}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isLow ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={usage.used}
            aria-valuemin={0}
            aria-valuemax={usage.limit}
            aria-label={`${usage.used} de ${usage.limit} gerações de IA usadas`}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-background/60 p-3 text-xs",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-foreground">Gerações IA</span>
        <span className="text-muted-foreground">
          {usage.used}/{usage.limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isLow ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={usage.used}
          aria-valuemin={0}
          aria-valuemax={usage.limit}
        />
      </div>
      {isLow && usage.remaining > 0 && (
        <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">
          Restam {usage.remaining} gerações este mês.
        </p>
      )}
      {usage.remaining === 0 && (
        <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">
          Limite atingido.{" "}
          <Link href="/pricing" className="underline underline-offset-2">
            Fazer upgrade
          </Link>
        </p>
      )}
    </div>
  );
}
