"use client";

import { useMemo } from "react";

import { IngredientOffersSection } from "@/modules/offers/components/ingredient-offers-section";
import { useOffersForIngredients } from "@/shared/hooks/api/offers";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

type WeeklyPlanOffersSectionProps = {
  ingredientNames: string[];
};

export function WeeklyPlanOffersSection({
  ingredientNames,
}: WeeklyPlanOffersSectionProps) {
  const { region } = useOfferRegionPreference();

  const names = useMemo(
    () => [
      ...new Set(ingredientNames.map((name) => name.trim()).filter(Boolean)),
    ],
    [ingredientNames],
  );

  const { data, isLoading, error, refetch } = useOffersForIngredients(names, {
    context: "weekly_plan",
    city: region.city,
    state: region.state,
    radiusKm: region.radiusKm,
    enabled: names.length > 0,
  });

  if (names.length === 0) return null;

  return (
    <IngredientOffersSection
      id="ofertas-plano-semanal"
      title="Promoções do plano semanal"
      description="Itens da lista consolidada da semana com ofertas ativas na sua região."
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      emptyMessage="Nenhuma promoção encontrada para os itens do plano nesta região. Adicione à lista de compras e acompanhe ofertas depois."
    />
  );
}
