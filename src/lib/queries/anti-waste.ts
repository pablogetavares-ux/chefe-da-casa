import type { PantryItem } from "@/types/database";
import { getExpiryStatus } from "@/lib/utils/pantry";

export type PantryItemKind = "stock" | "leftover";

export type AntiWastePantryItem = PantryItem;

export type AntiWasteSummary = {
  expiringSoon: AntiWastePantryItem[];
  expired: AntiWastePantryItem[];
  leftovers: AntiWastePantryItem[];
  stats: {
    totalAtRisk: number;
    expiringSoonCount: number;
    expiredCount: number;
    leftoverCount: number;
  };
  suggestions: string[];
};

export function classifyPantryForAntiWaste(
  items: AntiWastePantryItem[],
): Pick<AntiWasteSummary, "expiringSoon" | "expired" | "leftovers" | "stats"> {
  const expiringSoon: AntiWastePantryItem[] = [];
  const expired: AntiWastePantryItem[] = [];
  const leftovers = items.filter((item) => item.item_kind === "leftover");

  for (const item of items) {
    const status = getExpiryStatus(item.expires_at);
    if (status === "expired") expired.push(item);
    else if (status === "soon") expiringSoon.push(item);
  }

  const atRiskIds = new Set<string>();
  for (const item of [...expiringSoon, ...expired, ...leftovers]) {
    atRiskIds.add(item.id);
  }

  return {
    expiringSoon,
    expired,
    leftovers,
    stats: {
      totalAtRisk: atRiskIds.size,
      expiringSoonCount: expiringSoon.length,
      expiredCount: expired.length,
      leftoverCount: leftovers.length,
    },
  };
}

export function formatPantryItemForPrompt(item: AntiWastePantryItem): string {
  const parts = [item.name];
  if (item.quantity != null) {
    parts.push(`${item.quantity}${item.unit ? ` ${item.unit}` : ""}`);
  }
  if (item.item_kind === "leftover") {
    parts.push("(sobra)");
  }
  const status = getExpiryStatus(item.expires_at);
  if (status === "expired") parts.push("[VENCIDO — prioridade máxima]");
  else if (status === "soon") parts.push("[vence em breve]");
  if (item.notes?.trim()) parts.push(`— ${item.notes.trim()}`);
  return parts.join(" ");
}

export function buildAntiWasteSuggestions(
  stats: AntiWasteSummary["stats"],
): string[] {
  const tips: string[] = [];
  if (stats.expiredCount > 0) {
    tips.push(
      `${stats.expiredCount} item(ns) vencido(s): priorize consumo imediato ou transformação (sopas, molhos, congelamento).`,
    );
  }
  if (stats.expiringSoonCount > 0) {
    tips.push(
      `${stats.expiringSoonCount} item(ns) vence(m) em até 3 dias — planeje refeições com eles primeiro.`,
    );
  }
  if (stats.leftoverCount > 0) {
    tips.push(
      `${stats.leftoverCount} sobra(s) registrada(s) — ideal para omeletes, wraps, saladas ou recheios.`,
    );
  }
  if (stats.totalAtRisk === 0) {
    tips.push(
      "Cadastre validades na despensa ou marque sobras para receber sugestões personalizadas.",
    );
  }
  return tips;
}
