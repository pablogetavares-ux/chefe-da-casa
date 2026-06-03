"use client";

import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MOBILE_PLANS } from "@/config/mobile-plans";
import { usePremiumAccess } from "@/shared/hooks/api/identity";

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
  const { isPremium, isLoading } = usePremiumAccess();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isPremium) {
    return <>{children}</>;
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
      <ul className="mx-auto mt-4 max-w-sm space-y-1 text-left text-sm text-muted-foreground">
        {MOBILE_PLANS.premium.features.slice(0, 4).map((feature) => (
          <li key={feature} className="flex gap-2">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/pricing">
          <Button className="gap-2">
            <Sparkles className="size-4" />
            Ver planos
          </Button>
        </Link>
        <Link href="/app/profile">
          <Button variant="outline">Meu plano</Button>
        </Link>
      </div>
    </div>
  );
}
