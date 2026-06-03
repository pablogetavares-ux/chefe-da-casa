import { describe, expect, it } from "vitest";

import { filterStoresByRegionScope } from "@/modules/offers/region/filter-stores";
import { distanceKm, isSameCity } from "@/modules/offers/region/geo";
import type {
  RegionalStoreGeo,
  UserOfferRegion,
} from "@/modules/offers/region/types";

const spRegion: UserOfferRegion = {
  city: "São Paulo",
  state: "SP",
  radiusKm: 50,
  latitude: -23.5505,
  longitude: -46.6333,
};

const stores: RegionalStoreGeo[] = [
  {
    id: "1",
    name: "Loja SP",
    chain: "Extra",
    city: "São Paulo",
    state: "SP",
    neighborhood: "Centro",
    latitude: -23.55,
    longitude: -46.63,
    is_active: true,
  },
  {
    id: "2",
    name: "Loja Campinas",
    chain: "Extra",
    city: "Campinas",
    state: "SP",
    neighborhood: null,
    latitude: -22.9099,
    longitude: -47.0626,
    is_active: true,
  },
  {
    id: "3",
    name: "Loja RJ",
    chain: "Extra",
    city: "Rio de Janeiro",
    state: "RJ",
    neighborhood: null,
    latitude: -22.9068,
    longitude: -43.1729,
    is_active: true,
  },
];

describe("distanceKm", () => {
  it("calcula distância entre SP e Campinas", () => {
    const km = distanceKm(-23.5505, -46.6333, -22.9099, -47.0626);
    expect(km).toBeGreaterThan(70);
    expect(km).toBeLessThan(110);
  });
});

describe("filterStoresByRegionScope", () => {
  it("mesma cidade", () => {
    const result = filterStoresByRegionScope(stores, spRegion, "same_city");
    expect(result.map((r) => r.store.id)).toEqual(["1"]);
  });

  it("cidades próximas dentro do raio", () => {
    const wideRegion = { ...spRegion, radiusKm: 100 as const };
    const result = filterStoresByRegionScope(stores, wideRegion, "nearby");
    expect(result.some((r) => r.store.city === "Campinas")).toBe(true);
    expect(result.every((r) => r.scope === "nearby")).toBe(true);
  });

  it("dentro do raio inclui mesma cidade e vizinhas", () => {
    const wideRegion = { ...spRegion, radiusKm: 100 as const };
    const result = filterStoresByRegionScope(
      stores,
      wideRegion,
      "within_radius",
    );
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

const bhRegion: UserOfferRegion = {
  city: "Belo Horizonte",
  state: "MG",
  radiusKm: 300,
  latitude: -19.9167,
  longitude: -43.9345,
};

const eastMgStores: RegionalStoreGeo[] = [
  ...stores,
  {
    id: "4",
    name: "Atacadão GV",
    chain: "Atacadão",
    city: "Governador Valadares",
    state: "MG",
    neighborhood: "Centro",
    latitude: -18.8512,
    longitude: -41.9495,
    is_active: true,
  },
];

describe("filterStoresByRegionScope — hub BH", () => {
  it("raio 300 km inclui Governador Valadares (leste de MG)", () => {
    const result = filterStoresByRegionScope(
      eastMgStores,
      bhRegion,
      "within_radius",
    );
    expect(result.some((r) => r.store.city === "Governador Valadares")).toBe(
      true,
    );
  });

  it("escopo nacional inclui todas as lojas ativas", () => {
    const result = filterStoresByRegionScope(
      eastMgStores,
      bhRegion,
      "national",
    );
    expect(result.length).toBe(eastMgStores.filter((s) => s.is_active).length);
    expect(result.every((r) => r.scope === "national")).toBe(true);
  });
});

describe("isSameCity", () => {
  it("compara cidade e UF", () => {
    expect(isSameCity("São Paulo", "SP", "São Paulo", "sp")).toBe(true);
    expect(isSameCity("Campinas", "SP", "São Paulo", "SP")).toBe(false);
  });
});
