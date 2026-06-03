"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChefHat, Leaf, Refrigerator, Sparkles, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Refrigerator,
    title: "Despensa inteligente",
    description:
      "Cadastre o que você tem em casa e deixe a IA sugerir receitas.",
  },
  {
    icon: Sparkles,
    title: "Receitas com IA",
    description: "Combinações saudáveis e saborosas geradas em segundos.",
  },
  {
    icon: Leaf,
    title: "Foco em saúde",
    description: "Preferências dietéticas respeitadas em cada sugestão.",
  },
  {
    icon: Timer,
    title: "Rápido no dia a dia",
    description: "Do ingrediente ao prato com passos claros e práticos.",
  },
];

export function HeroSection() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="container relative mx-auto flex flex-col items-center gap-10 px-4 py-20 text-center md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
          >
            <ChefHat className="size-4 text-primary" />
            Cozinhe melhor com o que já tem
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex max-w-3xl flex-col gap-5"
          >
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-6xl md:leading-[1.1]">
              Receitas saudáveis com o que você já tem em casa
            </h1>
            <p className="text-lg text-muted-foreground text-pretty md:text-xl">
              {siteConfig.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/signup">
              <Button size="lg" className="min-w-40 shadow-md">
                Começar grátis
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="min-w-40">
                Ver planos
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="grid w-full max-w-2xl grid-cols-3 gap-4 pt-4"
          >
            {[
              { value: "10s", label: "para gerar receita" },
              { value: "100%", label: "personalizável" },
              { value: "0", label: "desperdício ideal" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border bg-card/60 px-3 py-4 backdrop-blur-sm"
              >
                <p className="font-heading text-2xl font-semibold text-primary md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-semibold md:text-4xl">
              Tudo que você precisa na cozinha
            </h2>
            <p className="mt-3 text-muted-foreground">
              Simples, bonito e pensado para o seu dia a dia.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-medium">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-accent/30 px-8 py-14 text-center md:px-16">
            <div className="relative z-10 mx-auto max-w-2xl space-y-5">
              <h2 className="font-heading text-3xl font-semibold md:text-4xl">
                Pronto para cozinhar com IA?
              </h2>
              <p className="text-muted-foreground">
                Crie sua conta grátis e transforme os ingredientes da sua
                despensa em refeições deliciosas.
              </p>
              <Link href="/signup">
                <Button size="lg">Criar conta grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
