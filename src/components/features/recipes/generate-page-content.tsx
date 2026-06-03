"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { AiConfigBanner } from "@/components/features/recipes/ai-config-banner";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const IngredientScannerPanel = dynamic(
  () =>
    import("@/components/features/recipes/ingredient-scanner-panel").then(
      (mod) => mod.IngredientScannerPanel,
    ),
  { loading: () => <PanelSkeleton rows={3} label="Carregando scanner..." /> },
);

const GenerateRecipePanel = dynamic(
  () =>
    import("@/components/features/recipes/generate-recipe-panel").then(
      (mod) => mod.GenerateRecipePanel,
    ),
  { loading: () => <PanelSkeleton rows={5} label="Carregando gerador..." /> },
);

const AiHistoryPanel = dynamic(
  () =>
    import("@/components/features/recipes/ai-history-panel").then(
      (mod) => mod.AiHistoryPanel,
    ),
  { loading: () => <PanelSkeleton rows={2} label="Carregando histórico..." /> },
);

export function GeneratePageContent() {
  const [scannedIngredients, setScannedIngredients] = useState<string[]>([]);

  return (
    <>
      <AiConfigBanner />

      <IngredientScannerPanel
        onIngredientsDetected={(names) => setScannedIngredients(names)}
      />

      <GenerateRecipePanel
        key={scannedIngredients.join("|")}
        initialIngredients={scannedIngredients}
      />

      <AiHistoryPanel />
    </>
  );
}
