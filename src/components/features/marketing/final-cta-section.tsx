"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  MARKETING_LANDING,
  MARKETING_PLANS_PAGE,
} from "@/config/marketing-landing";

export function FinalCtaSection() {
  const { finalCta } = MARKETING_LANDING;

  return (
    <section
      id="cta-final"
      className="scroll-mt-24 border-t py-16 md:py-20"
      aria-labelledby="cta-final-heading"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-emerald-500/10 px-6 py-12 sm:px-10 sm:py-14 md:px-14 md:py-16"
        >
          <div
            className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 size-48 rounded-full bg-emerald-500/15 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              SaaS de economia doméstica inteligente
            </p>

            <h2
              id="cta-final-heading"
              className="font-heading text-2xl font-semibold text-balance sm:text-3xl md:text-4xl md:leading-tight"
            >
              {finalCta.title}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              {finalCta.description}
            </p>

            <ul className="mt-6 flex flex-col gap-2 text-left sm:mx-auto sm:max-w-md">
              {finalCta.trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="min-h-12 w-full gap-2 text-base shadow-lg sm:min-w-52"
                >
                  {finalCta.primaryLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
              <Link href={MARKETING_PLANS_PAGE} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-12 w-full bg-background/80 sm:min-w-48"
                >
                  {finalCta.secondaryLabel}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
