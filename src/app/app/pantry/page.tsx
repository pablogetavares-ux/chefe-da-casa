import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const PantryPanel = dynamic(
  () =>
    import("@/components/features/pantry/pantry-panel").then(
      (mod) => mod.PantryPanel,
    ),
  { loading: () => <PanelSkeleton rows={4} label="Carregando despensa..." /> },
);

export const metadata: Metadata = {
  title: "Despensa",
};

export default function PantryPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Despensa"
        description="Cadastre os ingredientes que você tem em casa."
      />
      <PantryPanel />
    </AnimatedPage>
  );
}
