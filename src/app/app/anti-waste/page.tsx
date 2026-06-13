import type { Metadata } from "next";

import { AntiWastePanel } from "@/components/features/anti-waste/anti-waste-panel";
import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PremiumFeatureGate } from "@/components/shared/premium-feature-gate";

export const metadata: Metadata = {
  title: "Evite desperdício",
  description:
    "Reaproveite alimentos vencendo e sobras com receitas inteligentes geradas por IA.",
};

export default function AntiWastePage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Evite desperdício"
        description="Informe o que vence ou sobrou — a IA sugere receitas de reaproveitamento."
      />
      <PremiumFeatureGate
        title="Anti-desperdício com IA"
        description="Sugestões inteligentes para reaproveitar alimentos — disponível nos planos Pro e Família."
      >
        <AntiWastePanel />
      </PremiumFeatureGate>
    </AnimatedPage>
  );
}
