/** Classificação simples para o mock de dev gerar preparo coerente (doce vs salgado). */

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const SWEET_TERMS = [
  "banana",
  "maca",
  "mamao",
  "manga",
  "uva",
  "passa",
  "morango",
  "abacaxi",
  "mel",
  "acucar",
  "chocolate",
  "canela",
  "baunilha",
  "coco ralado",
  "leite condensado",
  "aveia",
  "granola",
  "melaco",
];

const SAVORY_TERMS = [
  "frango",
  "carne",
  "peixe",
  "ovo",
  "ovos",
  "cebola",
  "alho",
  "tomate",
  "arroz",
  "feijao",
  "batata",
  "cenoura",
  "brocolis",
  "couve",
  "pepino",
  "pimentao",
  "queijo",
  "bacon",
  "linguica",
  "carne moida",
  "salmao",
  "camarao",
];

function matchesAny(name: string, terms: string[]): boolean {
  const n = normalize(name);
  return terms.some((term) => n.includes(term));
}

export type MockRecipeProfile = "sweet" | "savory" | "mixed";

export type SweetDessertFormat =
  | "bolo"
  | "pudim"
  | "mingau"
  | "mousse"
  | "torta";

function ingredientText(ingredients: string[]): string {
  return ingredients.map(normalize).join(" ");
}

export function detectSweetDessertFormat(
  ingredients: string[],
  requested?: string,
): SweetDessertFormat {
  if (requested === "bolo" || requested === "torta") return requested;
  if (requested === "pudim" || requested === "creme") return "pudim";
  if (requested === "mingau") return "mingau";
  if (requested === "mousse") return "mousse";

  const text = ingredientText(ingredients);
  const hasEgg = /\bovo/.test(text);
  const hasFlour = /farinha|trigo|fuba|aveia/.test(text);
  const hasMilk = /leite|condensado|creme/.test(text);
  const hasBaking = /fermento|bicarbonato/.test(text);

  if (hasFlour && (hasEgg || hasBaking)) return "bolo";
  if (hasMilk && hasEgg && !hasFlour) return "pudim";
  if (hasFlour) return "bolo";
  if (hasMilk) return "pudim";
  return "mingau";
}

export function detectMockRecipeProfile(
  ingredients: string[],
): MockRecipeProfile {
  if (ingredients.length === 0) return "savory";

  let sweet = 0;
  let savory = 0;

  for (const name of ingredients) {
    if (matchesAny(name, SWEET_TERMS)) sweet += 1;
    if (matchesAny(name, SAVORY_TERMS)) savory += 1;
  }

  if (sweet > 0 && savory === 0) return "sweet";
  if (savory > 0 && sweet === 0) return "savory";
  if (sweet > 0 && savory > 0) return "mixed";
  return "savory";
}

export function mockQuantityForIngredient(name: string): {
  quantity: number;
  unit: string;
} {
  const n = normalize(name);

  if (n.includes("canela")) return { quantity: 1, unit: "col. chá" };
  if (n.includes("banana")) return { quantity: 2, unit: "un" };
  if (n.includes("uva") || n.includes("passa"))
    return { quantity: 2, unit: "col. sopa" };
  if (n.includes("aveia") || n.includes("farinha"))
    return { quantity: 0.5, unit: "xícara" };
  if (n.includes("ovo")) return { quantity: 2, unit: "un" };
  if (n.includes("tomate")) return { quantity: 3, unit: "un" };
  if (n.includes("cebola") || n.includes("alho"))
    return { quantity: 1, unit: "un" };
  if (n.includes("arroz") || n.includes("feijao"))
    return { quantity: 1, unit: "xícara" };
  if (n.includes("azeite")) return { quantity: 2, unit: "col. sopa" };

  return { quantity: 1, unit: "un" };
}
