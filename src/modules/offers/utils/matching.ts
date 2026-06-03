import type { Recipe } from "@/types/database";

import type { RegionalOfferRow } from "@/modules/offers/types";

export function normalizeOfferText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeOfferText(value)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWholeTerm(haystack: string, needle: string): boolean {
  if (!needle || !haystack) return false;
  if (haystack === needle) return true;

  const pattern = new RegExp(`(^|[\\s,/-])${escapeRegExp(needle)}($|[\\s,/-])`);

  return pattern.test(` ${haystack} `);
}

export function termsMatch(needle: string, haystack: string): boolean {
  if (!needle || !haystack) return false;

  const normalizedNeedle = normalizeOfferText(needle);
  const normalizedHaystack = normalizeOfferText(haystack);

  if (
    containsWholeTerm(normalizedHaystack, normalizedNeedle) ||
    containsWholeTerm(normalizedNeedle, normalizedHaystack)
  ) {
    return true;
  }

  const needleTokens = tokenize(normalizedNeedle);
  const haystackTokens = tokenize(normalizedHaystack);

  return needleTokens.some((token) => haystackTokens.includes(token));
}

function readIngredientName(item: unknown): string {
  if (typeof item === "string") return item.trim();
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    if (typeof record.name === "string") return record.name.trim();
    if (typeof record.ingredient === "string") return record.ingredient.trim();
    if (typeof record.text === "string") return record.text.trim();
  }
  return "";
}

export function extractRecipeIngredientNames(recipe: Recipe): string[] {
  const names = new Set<string>();
  const raw = recipe.ingredients;

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const name = readIngredientName(item);
      if (name) names.add(name);
    }
  }

  return [...names];
}

export function extractRecipeIngredientTerms(recipe: Recipe): string[] {
  const terms = new Set<string>();

  for (const name of extractRecipeIngredientNames(recipe)) {
    terms.add(normalizeOfferText(name));
    for (const token of tokenize(name)) {
      terms.add(token);
    }
  }

  for (const token of tokenize(recipe.title)) {
    terms.add(token);
  }

  return [...terms].filter(Boolean);
}

export function termsForIngredientName(name: string): string[] {
  const normalized = normalizeOfferText(name);
  const tokens = tokenize(name);
  return [...new Set([normalized, ...tokens].filter(Boolean))];
}

export function scoreOfferForRecipe(
  offer: RegionalOfferRow,
  ingredientTerms: string[],
): number {
  if (ingredientTerms.length === 0) return 0;

  const offerTexts = [
    offer.product_name,
    offer.title,
    offer.description ?? "",
    ...offer.ingredient_keywords,
  ].filter(Boolean);

  let score = 0;

  for (const term of ingredientTerms) {
    const hit = offerTexts.some((text) =>
      termsMatch(term, normalizeOfferText(text)),
    );
    if (hit) score += 1;
  }

  return score;
}

export function getOfferMatchedIngredients(
  offer: RegionalOfferRow,
  ingredientNames: string[],
): string[] {
  return ingredientNames.filter(
    (name) => scoreOfferForRecipe(offer, termsForIngredientName(name)) > 0,
  );
}
