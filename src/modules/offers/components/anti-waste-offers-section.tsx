"use client";

import { IngredientOffersSection } from "@/modules/offers/components/ingredient-offers-section";
import { useOffersForAntiWaste } from "@/shared/hooks/api/offers";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

export function AntiWasteOffersSection() {
  const { region } = useOfferRegionPreference();
  const { data, isLoading, error, refetch } = useOffersForAntiWaste({
    city: region.city,
    state: region.state,
    radiusKm: region.radiusKm,
  });

  return (
    <IngredientOffersSection
      id="ofertas-anti-waste"
      title="Promoções para reaproveitar"
      description="Ofertas na sua região relacionadas aos itens que vencem, sobras ou estão vencidos — complemente a receita anti-desperdício."
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      emptyMessage="Sem promoções ativas para os itens em risco agora. Gere a receita com o que você tem e confira a Central de Ofertas depois."
    />
  );
}
