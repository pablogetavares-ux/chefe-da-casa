import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function EconomyLoading() {
  return <PanelSkeleton rows={4} label="Carregando economia alimentar..." />;
}
