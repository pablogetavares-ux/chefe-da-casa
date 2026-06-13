"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deriveBillingHealth,
  shouldShowBillingBanner,
} from "@/lib/billing/subscription-state";
import {
  useBillingPortal,
  useBillingSubscription,
} from "@/shared/hooks/api/identity";

export function BillingStatusBanner() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useBillingSubscription();
  const portal = useBillingPortal();

  if (isLoading || !data) return null;

  const health =
    data.billingHealth ?? deriveBillingHealth(data.plan, data.subscription);

  if (!shouldShowBillingBanner(health)) return null;

  const isWarning =
    health.state === "past_due" ||
    health.state === "unpaid" ||
    health.state === "incomplete";

  return (
    <div
      role="status"
      className={cn(
        "border-b px-4 py-2 text-sm",
        isWarning
          ? "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
          : "border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-100",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">{health.title}</p>
            <p className="text-pretty opacity-90">{health.message}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {health.recoverable && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              disabled={portal.isPending}
              onClick={() => {
                if (
                  health.state === "past_due" ||
                  health.state === "unpaid" ||
                  health.state === "incomplete"
                ) {
                  portal.mutate();
                  return;
                }

                void queryClient.invalidateQueries({ queryKey: ["billing"] });
                void queryClient.invalidateQueries({
                  queryKey: ["plan-usage"],
                });
                void queryClient.invalidateQueries({ queryKey: ["profile"] });
              }}
            >
              <RefreshCw className="size-3.5" />
              {portal.isPending
                ? "Abrindo..."
                : health.state === "past_due" ||
                    health.state === "unpaid" ||
                    health.state === "incomplete"
                  ? "Regularizar pagamento"
                  : "Atualizar status"}
            </Button>
          )}
          <Link
            href="/app/profile"
            className={buttonVariants({ size: "sm", variant: "ghost" })}
          >
            Meu plano
          </Link>
        </div>
      </div>
    </div>
  );
}
