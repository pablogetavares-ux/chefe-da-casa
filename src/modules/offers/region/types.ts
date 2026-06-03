/** Escopo de exibição de ofertas na região do usuário. */
export type OfferRegionScope =
  | "same_city"
  | "nearby"
  | "within_radius"
  | "national";

export type OfferSearchRadiusKm = 10 | 25 | 50 | 100 | 300;

export type UserOfferRegion = {
  city: string;
  state: string;
  radiusKm: OfferSearchRadiusKm;
  latitude: number;
  longitude: number;
};

export type RegionalStoreGeo = {
  id: string;
  name: string;
  chain: string;
  city: string;
  state: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
};

export type StoreRegionMatch = {
  store: RegionalStoreGeo;
  distanceKm: number;
  scope: OfferRegionScope;
};

export type OfferRegionCityOption = {
  city: string;
  state: string;
  label: string;
};

export type OfferRegionConfigResponse = {
  region: UserOfferRegion;
  cities: OfferRegionCityOption[];
  radiusOptions: OfferSearchRadiusKm[];
  scopeOptions: OfferRegionScope[];
};
