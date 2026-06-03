"use client";

import { Star } from "lucide-react";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";

const testimonials = [
  {
    name: "Mariana S.",
    role: "Mãe de 2 · Plano Família",
    quote:
      "Parei de jogar comida fora. A IA sugere receitas com o que sobrou na geladeira e minha lista de compras fica pronta.",
    rating: 5,
  },
  {
    name: "Rafael T.",
    role: "Atleta amador · Plano Pro",
    quote:
      "Modo fitness salvou minha semana. Macros claros, receitas rápidas e zero planilha.",
    rating: 5,
  },
  {
    name: "Camila L.",
    role: "Estudante · Plano Gratuito",
    quote:
      "Comecei no gratuito e já virei fã. Interface linda, funciona bem no celular.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-14">
          <SectionHeading
            eyebrow="Depoimentos"
            title="Chefs reais, rotina real"
            description="Quem usa no dia a dia conta como o Chef da Casa simplificou a cozinha."
          />
        </FadeInView>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <FadeInView key={item.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t pt-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </figcaption>
              </figure>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
