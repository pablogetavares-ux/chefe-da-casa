"use client";

import { Clock, Heart, PiggyBank, Recycle } from "lucide-react";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { MARKETING_LANDING } from "@/config/marketing-landing";

const benefitIcons = [PiggyBank, Clock, Heart, Recycle] as const;

export function BenefitsSection() {
  return (
    <section
      id="beneficios"
      className="scroll-mt-24 border-t bg-muted/30 py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        <FadeInView className="mb-10 md:mb-14">
          <SectionHeading
            eyebrow="Benefícios"
            title="Tudo o que sua família precisa no dia a dia"
            description="Menos improviso na cozinha, mais controle nas compras e economia real no fim do mês."
          />
        </FadeInView>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {MARKETING_LANDING.benefits.map((benefit, i) => {
            const Icon = benefitIcons[i] ?? PiggyBank;
            return (
              <FadeInView key={benefit.title} delay={i * 0.06}>
                <article className="group h-full rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-heading text-lg font-medium">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}
