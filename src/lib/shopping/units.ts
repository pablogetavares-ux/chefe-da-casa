export type UnitFamily = "mass" | "volume" | "count" | "portion" | "unknown";

const UNIT_MAP: Record<
  string,
  { family: UnitFamily; toBase: number; baseLabel: string }
> = {
  kg: { family: "mass", toBase: 1, baseLabel: "kg" },
  g: { family: "mass", toBase: 0.001, baseLabel: "kg" },
  grama: { family: "mass", toBase: 0.001, baseLabel: "kg" },
  gramas: { family: "mass", toBase: 0.001, baseLabel: "kg" },
  l: { family: "volume", toBase: 1, baseLabel: "L" },
  litro: { family: "volume", toBase: 1, baseLabel: "L" },
  litros: { family: "volume", toBase: 1, baseLabel: "L" },
  ml: { family: "volume", toBase: 0.001, baseLabel: "L" },
  un: { family: "count", toBase: 1, baseLabel: "un" },
  und: { family: "count", toBase: 1, baseLabel: "un" },
  unidade: { family: "count", toBase: 1, baseLabel: "un" },
  unidades: { family: "count", toBase: 1, baseLabel: "un" },
  dz: { family: "count", toBase: 12, baseLabel: "un" },
  duzia: { family: "count", toBase: 12, baseLabel: "un" },
  "col. sopa": { family: "portion", toBase: 1, baseLabel: "col. sopa" },
  "colher de sopa": { family: "portion", toBase: 1, baseLabel: "col. sopa" },
  "col. cha": { family: "portion", toBase: 1, baseLabel: "col. chá" },
  "col. chá": { family: "portion", toBase: 1, baseLabel: "col. chá" },
  xicara: { family: "portion", toBase: 1, baseLabel: "xícara" },
  xícara: { family: "portion", toBase: 1, baseLabel: "xícara" },
  pitada: { family: "portion", toBase: 1, baseLabel: "pitada" },
  pct: { family: "count", toBase: 1, baseLabel: "pct" },
  pacote: { family: "count", toBase: 1, baseLabel: "pct" },
};

export function normalizeUnitKey(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolveUnit(unit: string) {
  const key = normalizeUnitKey(unit);
  return (
    UNIT_MAP[key] ?? {
      family: "unknown" as const,
      toBase: 1,
      baseLabel: unit.trim() || "un",
    }
  );
}

/** Converte quantidade para unidade base da família (kg, L, un). */
export function toBaseQuantity(quantity: number, unit: string) {
  const resolved = resolveUnit(unit);
  return {
    family: resolved.family,
    baseValue: quantity * resolved.toBase,
    baseLabel: resolved.baseLabel,
    estimated: resolved.family === "unknown",
  };
}

/** Formata quantidade legível a partir da base. */
export function formatDisplayQuantity(
  baseValue: number,
  family: UnitFamily,
  baseLabel: string,
) {
  if (family === "mass") {
    if (baseValue >= 1) {
      return { quantity: Math.round(baseValue * 100) / 100, unit: "kg" };
    }
    return { quantity: Math.round(baseValue * 1000), unit: "g" };
  }

  if (family === "volume") {
    if (baseValue >= 1) {
      return { quantity: Math.round(baseValue * 100) / 100, unit: "L" };
    }
    return { quantity: Math.round(baseValue * 1000), unit: "ml" };
  }

  if (family === "count") {
    if (baseLabel === "pct") {
      return { quantity: Math.round(baseValue * 100) / 100, unit: "pct" };
    }
    if (baseValue >= 12 && baseValue % 12 === 0) {
      return { quantity: baseValue / 12, unit: "dz" };
    }
    return { quantity: Math.round(baseValue * 100) / 100, unit: "un" };
  }

  return { quantity: Math.round(baseValue * 100) / 100, unit: baseLabel };
}
