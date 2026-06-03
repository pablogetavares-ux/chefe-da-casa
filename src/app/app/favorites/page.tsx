import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const FavoritesPanel = dynamic(
  () =>
    import("@/components/features/favorites/favorites-panel").then(
      (mod) => mod.FavoritesPanel,
    ),
  { loading: () => <PanelSkeleton rows={4} label="Carregando favoritas..." /> },
);

export const metadata: Metadata = {
  title: "Favoritas",
};

export default function FavoritesPage() {
  return <FavoritesPanel />;
}
