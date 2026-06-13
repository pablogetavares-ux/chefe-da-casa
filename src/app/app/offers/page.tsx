import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const OffersHub = dynamic(
  () =>
    import("@/modules/offers/components/offers-hub").then(
      (mod) => mod.OffersHub,
    ),
  {
    loading: () => (
      <PanelSkeleton rows={4} label="Carregando central de ofertas..." />
    ),
  },
);

export const metadata: Metadata = {
  title: "Central de Ofertas",
  description:
    "Supermercados, farmácias, pet shop e mais — promoções na sua região.",
};

export default function OffersPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Ofertas"
        description="Escolha uma categoria e encontre promoções perto de você."
      />
      <OffersHub />
    </AnimatedPage>
  );
}
