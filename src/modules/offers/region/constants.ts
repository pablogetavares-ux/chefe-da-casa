import type {
  OfferRegionScope,
  OfferSearchRadiusKm,
} from "@/modules/offers/region/types";

export const OFFER_SEARCH_RADIUS_OPTIONS: OfferSearchRadiusKm[] = [
  10, 25, 50, 100, 300,
];

/** Hub BH — cobre leste de MG (~300 km) e região metropolitana. */
export const DEFAULT_OFFER_SEARCH_RADIUS_KM: OfferSearchRadiusKm = 300;

export const OFFER_REGION_SCOPE_OPTIONS: OfferRegionScope[] = [
  "within_radius",
  "same_city",
  "nearby",
  "national",
];

export const OFFER_REGION_SCOPE_LABELS: Record<OfferRegionScope, string> = {
  within_radius: "Dentro do raio",
  same_city: "Mesma cidade",
  nearby: "Cidades próximas",
  national: "Todo o Brasil",
};

export const BRAZIL_STATE_OPTIONS = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
] as const;
