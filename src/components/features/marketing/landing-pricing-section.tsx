"use client";

import Link from "next/link";

import { PricingPlans } from "@/components/features/marketing/pricing-plans";
import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MARKETING_PLANS_PAGE } from "@/config/marketing-landing";

type LandingPricingSectionProps = {
  isAuthenticated: boolean;
};

export function LandingPricingSection({
  isAuthenticated,
}: LandingPricingSectionProps) {
  return (
    <section id="planos" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-10 md:mb-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary">Planos flexíveis</Badge>
            <SectionHeading
              title="Escolha o plano ideal para sua família"
              description="Comece grátis com ofertas regionais. Evolua quando quiser — sem alterar como você assina hoje."
            />
          </div>
        </FadeInView>

        <FadeInView delay={0.08}>
          <PricingPlans isAuthenticated={isAuthenticated} />
        </FadeInView>

        <FadeInView delay={0.16} className="mt-8 text-center">
          <Link href={MARKETING_PLANS_PAGE}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Comparar planos em tela dedicada →
            </Button>
          </Link>
        </FadeInView>
      </div>
    </section>
  );
}
