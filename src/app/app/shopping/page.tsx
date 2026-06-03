import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const SmartShoppingPanel = dynamic(
  () =>
    import("@/modules/shopping/components/smart-shopping-panel").then(
      (mod) => mod.SmartShoppingPanel,
    ),
  { loading: () => <PanelSkeleton rows={5} label="Carregando lista..." /> },
);

export const metadata: Metadata = {
  title: "Lista de compras",
};

export default function ShoppingPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Lista inteligente"
        description="Organize compras por categoria, conecte ofertas regionais e importe ingredientes das receitas."
      />
      <SmartShoppingPanel />
    </AnimatedPage>
  );
}
