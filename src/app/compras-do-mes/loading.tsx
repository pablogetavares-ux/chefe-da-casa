import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function ComprasDoMesLoading() {
  return <PanelSkeleton rows={5} label="Carregando compras do mês..." />;
}
