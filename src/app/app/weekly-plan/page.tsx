import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const WeeklyMealPlanPanel = dynamic(
  () =>
    import("@/modules/weekly-plan/components/weekly-meal-plan-panel").then(
      (mod) => mod.WeeklyMealPlanPanel,
    ),
  { loading: () => <PanelSkeleton rows={5} label="Carregando plano..." /> },
);

export const metadata: Metadata = {
  title: "Plano semanal",
  description:
    "Planeje 7 dias de refeições com lista de compras e custo por mercado.",
};

export default function WeeklyPlanPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Plano semanal"
        description="Escolha economizar, saúde ou proteína. Geramos o cardápio, a lista de compras e o mercado mais barato do catálogo."
      />
      <WeeklyMealPlanPanel />
    </AnimatedPage>
  );
}
