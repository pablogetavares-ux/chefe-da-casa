"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChefHat, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MARKETING_LANDING,
  MARKETING_PLANS_PAGE,
} from "@/config/marketing-landing";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="container relative mx-auto flex flex-col items-center gap-8 px-4 py-14 text-center sm:gap-10 sm:py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex max-w-full items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
        >
          <ChefHat className="size-4 shrink-0 text-primary" />
          <span className="truncate">{MARKETING_LANDING.heroEyebrow}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="flex max-w-4xl flex-col gap-4 sm:gap-5"
        >
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-6xl md:leading-[1.08]">
            {MARKETING_LANDING.tagline}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg md:text-xl">
            {MARKETING_LANDING.subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="min-h-11 w-full min-w-40 shadow-md sm:w-auto"
            >
              Começar grátis
            </Button>
          </Link>
          <Link href={MARKETING_PLANS_PAGE} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="min-h-11 w-full min-w-40 sm:w-auto"
            >
              Ver planos
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="grid w-full max-w-3xl grid-cols-2 gap-3 pt-2 sm:gap-4 md:grid-cols-4"
        >
          {MARKETING_LANDING.heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card/60 px-3 py-3.5 backdrop-blur-sm sm:py-4"
            >
              <p className="font-heading text-xl font-semibold text-primary sm:text-2xl md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs md:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
        >
          <Sparkles className="size-3.5 text-primary" />
          Receitas, despensa, compras e ofertas — integrados no app
        </motion.p>
      </div>
    </section>
  );
}
