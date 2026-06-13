"use client";

import { Check } from "lucide-react";

import { PlanSelectButton } from "@/components/features/marketing/plan-select-button";
import { Badge } from "@/components/ui/badge";
import { OFFERS_MARKETING } from "@/config/offers-experience";
import { PLAN_MARKETING, formatPlanPrice } from "@/config/marketing-plans";
import { PLANS, type PlanId } from "@/config/plans";
import { cn } from "@/lib/utils";

type PricingPlansProps = {
  isAuthenticated: boolean;
  currentPlanId?: PlanId;
  billingAvailable?: boolean;
};

export function PricingPlans({
  isAuthenticated,
  currentPlanId = "free",
  billingAvailable = false,
}: PricingPlansProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        {OFFERS_MARKETING.shortDescription} {OFFERS_MARKETING.compareNote}
      </p>
      {billingAvailable && isAuthenticated ? (
        <p className="text-center text-xs text-muted-foreground">
          Modo demonstração: escolha qualquer plano sem cobrança real.
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {(Object.keys(PLANS) as PlanId[]).map((planId) => {
          const plan = PLANS[planId];
          const marketing = PLAN_MARKETING[planId];
          const isPro = planId === "pro";
          const isCurrent = isAuthenticated && currentPlanId === planId;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-5 shadow-sm transition-all sm:p-6",
                isPro
                  ? "border-primary/40 bg-gradient-to-b from-primary/8 to-card ring-1 ring-primary/20 hover:shadow-lg"
                  : "bg-card hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              {marketing.highlight ? (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {marketing.highlight}
                </Badge>
              ) : null}
              {isCurrent ? (
                <Badge
                  variant="secondary"
                  className="absolute -top-3 right-4 sm:right-6"
                >
                  Seu plano
                </Badge>
              ) : null}

              <h2 className="font-heading text-xl font-semibold">
                {plan.name}
              </h2>
              <p className="mt-1 min-h-[2.5rem] text-sm text-muted-foreground">
                {marketing.tagline}
              </p>
              <p className="mt-4 font-heading text-4xl font-semibold tracking-tight">
                {formatPlanPrice(planId)}
                {plan.priceMonthly > 0 ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                ) : null}
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <PlanSelectButton
                planId={planId}
                isAuthenticated={isAuthenticated}
                isCurrent={isCurrent}
                billingAvailable={billingAvailable}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
