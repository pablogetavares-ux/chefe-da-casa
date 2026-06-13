"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MARKETING_PLANS_PAGE } from "@/config/marketing-landing";
import {
  MARKETING_PLANS_SECTION,
  PLAN_MARKETING,
  formatPlanPrice,
} from "@/config/marketing-plans";
import { PLANS, type PlanId } from "@/config/plans";
import { cn } from "@/lib/utils";

const planOrder: PlanId[] = ["free", "pro", "family"];

function PlanPreviewCard({ planId }: { planId: PlanId }) {
  const plan = PLANS[planId];
  const marketing = PLAN_MARKETING[planId];
  const isPro = planId === "pro";
  const features = plan.features.slice(0, marketing.previewFeatures);

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-all sm:p-6",
        isPro
          ? "border-primary/40 bg-gradient-to-b from-primary/8 to-card ring-1 ring-primary/15 hover:shadow-lg"
          : "bg-card hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      {marketing.highlight ? (
        <Badge
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2",
            isPro && "shadow-sm",
          )}
        >
          {marketing.highlight}
        </Badge>
      ) : null}

      <p className="font-heading text-xl font-semibold">{plan.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{marketing.tagline}</p>
      <p className="mt-4 font-heading text-3xl font-semibold tracking-tight">
        {formatPlanPrice(planId)}
        {plan.priceMonthly > 0 ? (
          <span className="text-sm font-normal text-muted-foreground">
            /mês
          </span>
        ) : null}
      </p>

      <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted-foreground">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function LandingPlansSection() {
  return (
    <section id="planos" className="scroll-mt-24 border-t py-16 md:py-24">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-10 md:mb-12">
          <SectionHeading
            eyebrow={MARKETING_PLANS_SECTION.eyebrow}
            title={MARKETING_PLANS_SECTION.title}
            description={MARKETING_PLANS_SECTION.description}
          />
        </FadeInView>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {planOrder.map((planId, i) => (
            <FadeInView key={planId} delay={i * 0.07}>
              <PlanPreviewCard planId={planId} />
            </FadeInView>
          ))}
        </div>

        <FadeInView
          delay={0.25}
          className="mt-10 flex flex-col items-center gap-4 text-center"
        >
          <p className="max-w-lg text-xs text-muted-foreground sm:text-sm">
            {MARKETING_PLANS_SECTION.footnote}
          </p>
          <Link href={MARKETING_PLANS_PAGE}>
            <Button size="lg" className="min-h-11 gap-2 px-8">
              Ver planos completos e assinar
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
        </FadeInView>
      </div>
    </section>
  );
}
