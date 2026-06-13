"use client";

import Link from "next/link";
import { CreditCard, FlaskConical, RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS, type PlanId } from "@/config/plans";
import { ErrorFallback } from "@/components/shared/error-fallback";
import {
  deriveBillingHealth,
  shouldShowBillingBanner,
} from "@/lib/billing/subscription-state";
import {
  useBillingCheckout,
  useBillingPortal,
  useBillingSubscription,
} from "@/hooks/use-api";

type BillingSectionProps = {
  billingAvailable: boolean;
  billingMock?: boolean;
};

function planLabel(plan: string) {
  const key = plan.toLowerCase() as PlanId;
  return PLANS[key]?.name ?? plan;
}

export function BillingSection({
  billingAvailable,
  billingMock = false,
}: BillingSectionProps) {
  const { data, isLoading, error, refetch, isFetching } =
    useBillingSubscription();
  const checkout = useBillingCheckout();
  const portal = useBillingPortal();

  const currentPlan = data?.plan ?? "FREE";
  const subscription = data?.subscription;
  const billingHealth =
    data?.billingHealth ?? deriveBillingHealth(currentPlan, subscription);
  const hasPaidPlan = currentPlan !== "FREE";
  const canManage =
    !billingMock &&
    subscription &&
    ["ACTIVE", "TRIALING", "PAST_DUE"].includes(subscription.status);

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          Plano e assinatura
        </CardTitle>
        <CardDescription>
          Gerencie seu plano e limites de uso da IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <ErrorFallback
            compact
            title="Erro ao carregar assinatura"
            message={error.message}
            reset={() => void refetch()}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Plano atual</span>
              <Badge variant="secondary" className="text-sm">
                {isLoading ? "..." : planLabel(currentPlan)}
              </Badge>
              {subscription?.cancel_at_period_end && (
                <Badge variant="outline">Cancela ao fim do período</Badge>
              )}
              {subscription?.status && subscription.status !== "ACTIVE" && (
                <Badge variant="outline">{subscription.status}</Badge>
              )}
            </div>

            {shouldShowBillingBanner(billingHealth) && (
              <div
                role="status"
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-950 dark:text-amber-100"
              >
                <p className="font-medium">{billingHealth.title}</p>
                <p className="mt-1 text-pretty opacity-90">
                  {billingHealth.message}
                </p>
                {billingHealth.recoverable && billingAvailable && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(billingHealth.state === "past_due" ||
                      billingHealth.state === "unpaid" ||
                      billingHealth.state === "incomplete") && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={portal.isPending}
                        onClick={() => portal.mutate()}
                      >
                        {portal.isPending
                          ? "Abrindo..."
                          : "Regularizar pagamento"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      disabled={isFetching}
                      onClick={() => void refetch()}
                    >
                      <RefreshCw className="size-3.5" />
                      {isFetching ? "Atualizando..." : "Atualizar status"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {billingMock && (
              <div
                role="status"
                className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-900 dark:text-blue-200"
              >
                <FlaskConical className="mt-0.5 size-4 shrink-0" />
                <p>
                  Modo demonstração: upgrades são simulados localmente. Para
                  cobrança real, configure{" "}
                  <code className="text-xs">STRIPE_*</code> no{" "}
                  <code className="text-xs">.env</code>.
                </p>
              </div>
            )}

            {!billingAvailable && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
                Pagamentos indisponíveis neste ambiente.
              </p>
            )}

            {billingAvailable && !hasPaidPlan && (
              <div className="grid gap-3 sm:grid-cols-2">
                {(["pro", "family"] as const).map((planId) => {
                  const plan = PLANS[planId];
                  return (
                    <div
                      key={planId}
                      className="rounded-xl border bg-muted/30 p-4"
                    >
                      <p className="font-heading font-semibold">{plan.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        R$ {plan.priceMonthly.toFixed(2).replace(".", ",")}/mês
                      </p>
                      <Button
                        className="mt-4 w-full gap-2"
                        size="sm"
                        disabled={checkout.isPending}
                        onClick={() => checkout.mutate(planId)}
                      >
                        <Sparkles className="size-3.5" />
                        {checkout.isPending
                          ? "Processando..."
                          : billingMock
                            ? "Simular upgrade"
                            : "Assinar"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {billingAvailable && hasPaidPlan && (
              <div className="flex flex-wrap gap-3">
                {canManage && (
                  <Button
                    variant="outline"
                    disabled={portal.isPending}
                    onClick={() => portal.mutate()}
                  >
                    {portal.isPending ? "Abrindo..." : "Gerenciar assinatura"}
                  </Button>
                )}
                <Link href="/pricing">
                  <Button variant="ghost">Ver todos os planos</Button>
                </Link>
              </div>
            )}

            {billingAvailable && !hasPaidPlan && (
              <Link href="/pricing">
                <Button variant="ghost">Comparar planos</Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
