import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const RecipesPanel = dynamic(
  () =>
    import("@/components/features/recipes/recipes-panel").then(
      (mod) => mod.RecipesPanel,
    ),
  { loading: () => <PanelSkeleton rows={4} label="Carregando receitas..." /> },
);

export const metadata: Metadata = {
  title: "Receitas",
};

export default function RecipesPage() {
  return <RecipesPanel />;
}
