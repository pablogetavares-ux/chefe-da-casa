"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/config/plans";
import { useBillingCheckout } from "@/hooks/use-api";

type PricingPlansProps = {
  isAuthenticated: boolean;
};

export function PricingPlans({ isAuthenticated }: PricingPlansProps) {
  const router = useRouter();
  const checkout = useBillingCheckout();

  const handlePlanClick = (planId: PlanId) => {
    if (planId === "free") return;

    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }

    checkout.mutate(planId);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      {Object.values(PLANS).map((plan) => {
        const isPro = plan.id === "pro";
        const isPending = checkout.isPending;

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md ${
              isPro
                ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card ring-1 ring-primary/20"
                : "bg-card"
            }`}
          >
            {isPro && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Mais popular
              </Badge>
            )}
            <h2 className="font-heading text-xl font-semibold">{plan.name}</h2>
            <p className="mt-3 font-heading text-4xl font-semibold">
              {plan.priceMonthly === 0
                ? "Grátis"
                : `R$ ${plan.priceMonthly.toFixed(2).replace(".", ",")}`}
              {plan.priceMonthly > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              )}
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            {plan.id === "free" ? (
              <Link
                href={isAuthenticated ? "/app" : "/signup"}
                className="mt-8 block"
              >
                <Button className="w-full" variant="outline">
                  {isAuthenticated ? "Plano atual" : "Começar grátis"}
                </Button>
              </Link>
            ) : (
              <Button
                className="mt-8 w-full"
                variant={isPro ? "default" : "outline"}
                disabled={isPending}
                onClick={() => handlePlanClick(plan.id)}
              >
                {isPending
                  ? "Redirecionando..."
                  : isAuthenticated
                    ? "Assinar"
                    : "Criar conta e assinar"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
