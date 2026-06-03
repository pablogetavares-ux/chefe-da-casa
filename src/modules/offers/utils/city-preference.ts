import { DEFAULT_OFFER_CITY } from "@/modules/offers/types";

export const OFFER_CITY_STORAGE_KEY = "chef-offers-city";

export function getStoredOfferCity(): string {
  if (typeof window === "undefined") return DEFAULT_OFFER_CITY;
  return localStorage.getItem(OFFER_CITY_STORAGE_KEY) ?? DEFAULT_OFFER_CITY;
}

export function setStoredOfferCity(city: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OFFER_CITY_STORAGE_KEY, city);
}
