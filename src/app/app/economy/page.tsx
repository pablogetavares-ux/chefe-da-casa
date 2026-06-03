import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const EconomyDashboardPanel = dynamic(
  () =>
    import("@/modules/economy/components/economy-dashboard-panel").then(
      (mod) => mod.EconomyDashboardPanel,
    ),
  {
    loading: () => (
      <PanelSkeleton rows={4} label="Carregando economia alimentar..." />
    ),
  },
);

export const metadata: Metadata = {
  title: "Economia alimentar",
  description:
    "Veja quanto você economizou, compare meses, custo médio das receitas e mercados mais usados.",
};

export default function EconomyPage() {
  return <EconomyDashboardPanel />;
}
