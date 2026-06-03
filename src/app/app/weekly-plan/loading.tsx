import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function WeeklyPlanLoading() {
  return <PanelSkeleton rows={5} label="Carregando plano semanal..." />;
}
