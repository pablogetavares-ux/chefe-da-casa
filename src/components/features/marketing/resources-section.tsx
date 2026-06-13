"use client";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { MARKETING_LANDING } from "@/config/marketing-landing";

export function ResourcesSection() {
  return (
    <section id="recursos" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-10 md:mb-14">
          <SectionHeading
            eyebrow="Recursos"
            title="Do ingrediente à economia — em um só app"
            description="Fluxo completo pensado para mobile: rápido no celular, poderoso no desktop."
          />
        </FadeInView>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {MARKETING_LANDING.resources.map((item, i) => (
            <FadeInView key={item.step} delay={i * 0.05}>
              <article className="group relative h-full rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-heading text-4xl font-bold text-primary/10 sm:text-5xl">
                    {item.step}
                  </span>
                  {item.title.includes("Premium") ? (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      Premium
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 font-heading text-lg font-medium">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
