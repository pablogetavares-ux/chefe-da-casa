"use client";

import Link from "next/link";
import { Crown, RefreshCw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OFFERS_MARKETING } from "@/config/offers-experience";
import { MOBILE_PLANS } from "@/config/mobile-plans";
import { isPremiumTier } from "@/lib/billing/premium";
import {
  deriveBillingHealth,
  shouldShowBillingBanner,
} from "@/lib/billing/subscription-state";
import {
  useBillingSubscription,
  usePremiumAccess,
} from "@/shared/hooks/api/identity";

type PremiumFeatureGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function PremiumFeatureGate({
  children,
  title = "Recurso Premium",
  description = "Disponível nos planos Pro e Família — comparador de preços, mais IA e despensa ampliada.",
}: PremiumFeatureGateProps) {
  const queryClient = useQueryClient();
  const { isPremium, isLoading, plan } = usePremiumAccess();
  const { data: billingData, isLoading: billingLoading } =
    useBillingSubscription();

  if (isLoading || billingLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const billingHealth = billingData
    ? (billingData.billingHealth ??
      deriveBillingHealth(billingData.plan, billingData.subscription))
    : null;

  const paidButNotPremium =
    billingData?.subscription &&
    ["ACTIVE", "TRIALING"].includes(billingData.subscription.status) &&
    !isPremiumTier(billingData.plan) &&
    !isPremium;

  const premiumBlockedByBilling =
    billingHealth?.blocksPremiumFeatures && isPremium;

  if (isPremium && !premiumBlockedByBilling) {
    return <>{children}</>;
  }

  if (
    paidButNotPremium ||
    (billingHealth && shouldShowBillingBanner(billingHealth))
  ) {
    return (
      <div className="surface-card rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-500/10">
          <RefreshCw className="size-7 text-amber-600" />
        </div>
        <h2 className="font-heading text-xl font-bold">
          {billingHealth?.title ?? "Sincronizando seu plano"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {billingHealth?.message ??
            "Seu pagamento foi registrado. Aguarde alguns segundos ou atualize para liberar o acesso premium."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            className="gap-2"
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ["billing"] });
              void queryClient.invalidateQueries({ queryKey: ["plan-usage"] });
              void queryClient.invalidateQueries({ queryKey: ["profile"] });
            }}
          >
            <RefreshCw className="size-4" />
            Atualizar acesso
          </Button>
          <Link href="/app/profile">
            <Button variant="outline">Meu plano</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (premiumBlockedByBilling) {
    return (
      <div className="surface-card rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <h2 className="font-heading text-xl font-bold">
          {billingHealth?.title ?? "Assinatura suspensa"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {billingHealth?.message ??
            "Regularize o pagamento para voltar a usar recursos premium."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app/profile">
            <Button>Regularizar em Meu plano</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-8 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Crown className="size-7 text-primary" />
      </div>
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {plan !== "FREE" && (
        <p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground">
          Plano atual: {plan}. Se você já assinou, use Meu plano para
          sincronizar.
        </p>
      )}
      <ul className="mx-auto mt-4 max-w-sm space-y-1 text-left text-sm text-muted-foreground">
        {MOBILE_PLANS.premium.features.slice(0, 4).map((feature) => (
          <li key={feature} className="flex gap-2">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-4 max-w-md text-xs text-muted-foreground">
        {OFFERS_MARKETING.compareNote}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/pricing">
          <Button className="gap-2">
            <Sparkles className="size-4" />
            Ver planos
          </Button>
        </Link>
        <Link href="/app/offers">
          <Button variant="outline">Ver ofertas grátis</Button>
        </Link>
        <Link href="/app/profile">
          <Button variant="ghost">Meu plano</Button>
        </Link>
      </div>
    </div>
  );
}
