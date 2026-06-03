"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Preciso pagar para começar?",
    a: "Não. O plano Gratuito inclui gerações de receita com IA, despensa básica e favoritos. Você pode fazer upgrade quando quiser.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. O app foi pensado mobile first — navegação inferior, gestos e layout responsivo em todas as telas.",
  },
  {
    q: "A IA usa meus ingredientes reais?",
    a: "Sim. Ela lê sua despensa cadastrada (ou ingredientes escaneados por foto) para sugerir receitas personalizadas.",
  },
  {
    q: "Posso cancelar a assinatura?",
    a: "A qualquer momento pelo portal de billing no seu perfil. Sem multa, sem burocracia.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t bg-muted/20 py-20 md:py-28">
      <div className="container mx-auto max-w-3xl px-4">
        <FadeInView className="mb-12">
          <SectionHeading
            eyebrow="FAQ"
            title="Perguntas frequentes"
            description="Tudo o que você precisa saber antes de começar."
          />
        </FadeInView>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <FadeInView key={item.q} delay={i * 0.06}>
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-medium">{item.q}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t px-5 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  )}
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}
