import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";
import { PremiumFeatureGate } from "@/components/shared/premium-feature-gate";

const PriceComparatorPanel = dynamic(
  () =>
    import("@/modules/pricing/components/price-comparator-panel").then(
      (mod) => mod.PriceComparatorPanel,
    ),
  {
    loading: () => <PanelSkeleton rows={4} label="Carregando comparador..." />,
  },
);

const MarketsComparisonPanel = dynamic(
  () =>
    import("@/modules/markets/components/markets-comparison-panel").then(
      (mod) => mod.MarketsComparisonPanel,
    ),
  { loading: () => <PanelSkeleton rows={3} label="Comparando mercados..." /> },
);

export const metadata: Metadata = {
  title: "Comparar preços",
};

export default function ComparePage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Comparar preços"
        description="Veja qual mercado regional sai mais barato para sua lista ou cesta básica."
      />
      <PremiumFeatureGate
        title="Comparador de preços Premium"
        description="Compare mercados da sua região e economize na lista ou na cesta básica."
      >
        <Suspense fallback={<PanelSkeleton rows={4} />}>
          <PriceComparatorPanel />
        </Suspense>

        <div className="mt-10 space-y-4 border-t pt-8">
          <PageHeader
            title="Mercados do catálogo"
            description="Compare Atacadão, Extra, Carrefour e outros com base nos preços cadastrados e sua lista de compras."
          />
          <Suspense fallback={<PanelSkeleton rows={3} />}>
            <MarketsComparisonPanel />
          </Suspense>
        </div>
      </PremiumFeatureGate>
    </AnimatedPage>
  );
}
