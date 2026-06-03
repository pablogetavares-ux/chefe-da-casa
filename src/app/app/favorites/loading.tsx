import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function FavoritesLoading() {
  return <PanelSkeleton rows={5} label="Carregando favoritos" />;
}
