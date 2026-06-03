import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function ShoppingLoading() {
  return <PanelSkeleton rows={8} label="Carregando lista de compras" />;
}
