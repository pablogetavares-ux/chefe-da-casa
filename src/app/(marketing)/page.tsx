import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { HeroSection } from "@/components/features/marketing/hero-section";
import { HowItWorksSection } from "@/components/features/marketing/how-it-works-section";
import { HomePageJsonLd } from "@/components/shared/json-ld";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const TestimonialsSection = dynamic(
  () =>
    import("@/components/features/marketing/testimonials-section").then(
      (mod) => mod.TestimonialsSection,
    ),
  {
    loading: () => <PanelSkeleton rows={2} label="Carregando depoimentos..." />,
  },
);

const FaqSection = dynamic(
  () =>
    import("@/components/features/marketing/faq-section").then(
      (mod) => mod.FaqSection,
    ),
  { loading: () => <PanelSkeleton rows={3} label="Carregando FAQ..." /> },
);

export const metadata: Metadata = {
  title: "Início",
  description:
    "Crie receitas saudáveis com IA usando os ingredientes que você já tem em casa. Despensa inteligente, scanner e planos flexíveis.",
};

export default function HomePage() {
  return (
    <>
      <HomePageJsonLd />
      <HeroSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
