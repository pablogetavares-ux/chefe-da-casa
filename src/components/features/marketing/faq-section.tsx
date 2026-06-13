"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { MARKETING_FAQ } from "@/config/marketing-faq";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t bg-muted/20 py-16 md:py-24"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <FadeInView className="mb-10 md:mb-12">
          <SectionHeading
            eyebrow={MARKETING_FAQ.eyebrow}
            title={MARKETING_FAQ.title}
            description={MARKETING_FAQ.description}
          />
        </FadeInView>

        <div className="space-y-3">
          {MARKETING_FAQ.items.map((item, i) => {
            const isOpen = open === i;
            const buttonId = `${baseId}-faq-button-${i}`;
            const panelId = `${baseId}-faq-panel-${i}`;

            return (
              <FadeInView key={item.id} delay={i * 0.04}>
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="pr-2 text-sm font-medium leading-snug sm:text-base">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className={cn(
                      "border-t px-4 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground sm:px-5",
                      !isOpen && "hidden",
                    )}
                  >
                    {item.answer}
                  </div>
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}
