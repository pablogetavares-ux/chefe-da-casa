"use client";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Refrigerator,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Refrigerator,
    title: "Monte sua despensa",
    description:
      "Cadastre o que você tem em casa ou escaneie ingredientes com a câmera.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Peça uma receita",
    description:
      "A IA combina seus ingredientes com modos saudável, fitness, vegano e mais.",
  },
  {
    step: "03",
    icon: ShoppingCart,
    title: "Liste o que falta",
    description:
      "Gere automaticamente a lista de compras com base nas receitas escolhidas.",
  },
  {
    step: "04",
    icon: UtensilsCrossed,
    title: "Cozinhe e compartilhe",
    description:
      "Salve favoritos, converse com o Chef IA e inspire a comunidade.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="border-t bg-muted/20 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-14">
          <SectionHeading
            eyebrow="Como funciona"
            title="Do ingrediente ao prato em quatro passos"
            description="Um fluxo pensado para o dia a dia — rápido no celular, completo no desktop."
          />
        </FadeInView>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => (
            <FadeInView key={item.step} delay={i * 0.08}>
              <div className="group relative h-full rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <span className="font-heading text-5xl font-bold text-primary/10">
                  {item.step}
                </span>
                <div className="mt-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-medium">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
