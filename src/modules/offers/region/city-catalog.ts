import {
  DEFAULT_OFFER_CITY,
  DEFAULT_OFFER_STATE,
} from "@/modules/offers/types";

export type CityCoordinates = {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

/** Centros urbanos para cálculo de raio (expansível via API/parceiros). */
export const BRAZIL_CITY_CATALOG: CityCoordinates[] = [
  { city: "São Paulo", state: "SP", latitude: -23.5505, longitude: -46.6333 },
  {
    city: "Rio de Janeiro",
    state: "RJ",
    latitude: -22.9068,
    longitude: -43.1729,
  },
  {
    city: "Belo Horizonte",
    state: "MG",
    latitude: -19.9167,
    longitude: -43.9345,
  },
  {
    city: "Governador Valadares",
    state: "MG",
    latitude: -18.8512,
    longitude: -41.9495,
  },
  {
    city: "Teófilo Otoni",
    state: "MG",
    latitude: -17.8575,
    longitude: -41.5052,
  },
  { city: "Muriaé", state: "MG", latitude: -21.1306, longitude: -42.3666 },
  { city: "Caratinga", state: "MG", latitude: -19.7897, longitude: -42.1406 },
  { city: "Manhuaçu", state: "MG", latitude: -20.2584, longitude: -42.0336 },
  {
    city: "Juiz de Fora",
    state: "MG",
    latitude: -21.7642,
    longitude: -43.3496,
  },
  { city: "Ubá", state: "MG", latitude: -21.12, longitude: -42.9427 },
  { city: "Brasília", state: "DF", latitude: -15.7939, longitude: -47.8828 },
  { city: "Curitiba", state: "PR", latitude: -25.4284, longitude: -49.2733 },
  {
    city: "Porto Alegre",
    state: "RS",
    latitude: -30.0346,
    longitude: -51.2177,
  },
  { city: "Salvador", state: "BA", latitude: -12.9777, longitude: -38.5016 },
  { city: "Fortaleza", state: "CE", latitude: -3.7319, longitude: -38.5267 },
  { city: "Recife", state: "PE", latitude: -8.0476, longitude: -34.877 },
  { city: "Manaus", state: "AM", latitude: -3.119, longitude: -60.0217 },
  { city: "Goiânia", state: "GO", latitude: -16.6869, longitude: -49.2648 },
  { city: "Campinas", state: "SP", latitude: -22.9099, longitude: -47.0626 },
  {
    city: "Florianópolis",
    state: "SC",
    latitude: -27.5954,
    longitude: -48.548,
  },
  { city: "Vitória", state: "ES", latitude: -20.3155, longitude: -40.3128 },
  { city: "Natal", state: "RN", latitude: -5.7945, longitude: -35.211 },
];

export function cityCatalogKey(city: string, state: string) {
  return `${city.trim().toLowerCase()}|${state.trim().toUpperCase()}`;
}

const catalogByKey = new Map(
  BRAZIL_CITY_CATALOG.map((entry) => [
    cityCatalogKey(entry.city, entry.state),
    entry,
  ]),
);

export function resolveCityCoordinates(
  city: string,
  state: string,
): CityCoordinates | null {
  const exact = catalogByKey.get(cityCatalogKey(city, state));
  if (exact) return exact;

  const byCity = BRAZIL_CITY_CATALOG.find(
    (entry) => entry.city.toLowerCase() === city.trim().toLowerCase(),
  );
  return byCity ?? null;
}

export function defaultCityCoordinates(): CityCoordinates {
  return (
    resolveCityCoordinates(DEFAULT_OFFER_CITY, DEFAULT_OFFER_STATE) ??
    BRAZIL_CITY_CATALOG[0]!
  );
}

export function listCatalogCityOptions() {
  return BRAZIL_CITY_CATALOG.map((entry) => ({
    city: entry.city,
    state: entry.state,
    label: `${entry.city} — ${entry.state}`,
  }));
}
