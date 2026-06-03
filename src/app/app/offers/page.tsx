import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const OffersPanel = dynamic(
  () =>
    import("@/modules/offers/components/offers-panel").then(
      (mod) => mod.OffersPanel,
    ),
  { loading: () => <PanelSkeleton rows={4} label="Carregando ofertas..." /> },
);

export const metadata: Metadata = {
  title: "Ofertas regionais",
  description: "Promoções de supermercados na sua cidade.",
};

export default function OffersPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Ofertas regionais"
        description="Promoções de mercados perto de você — adicione direto à lista de compras."
      />
      <OffersPanel />
    </AnimatedPage>
  );
}
