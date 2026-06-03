import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function RecipesLoading() {
  return <PanelSkeleton rows={6} label="Carregando receitas" />;
}
