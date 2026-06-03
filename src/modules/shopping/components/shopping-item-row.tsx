"use client";

import Link from "next/link";
import { Check, ChefHat, Sparkles, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { SmartShoppingListItem } from "@/modules/shopping/types";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  recipe: "Receita",
  ai: "IA",
  offer: "Oferta",
};

type ShoppingItemRowProps = {
  item: SmartShoppingListItem;
  onToggle: (id: string, isChecked: boolean) => void;
  onDelete: (id: string) => void;
  toggling?: boolean;
  deleting?: boolean;
};

export function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: ShoppingItemRowProps) {
  return (
    <li
      className={cn(
        "surface-card flex items-center gap-3 px-4 py-3.5 transition-opacity",
        item.is_checked && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label={item.is_checked ? "Desmarcar" : "Marcar como comprado"}
        disabled={toggling}
        onClick={() => onToggle(item.id, !item.is_checked)}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
          item.is_checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary/50",
        )}
      >
        {item.is_checked && <Check className="size-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "font-medium",
              item.is_checked && "text-muted-foreground line-through",
            )}
          >
            {item.name}
          </p>
          {item.source !== "manual" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {item.source === "ai" ? (
                <Sparkles className="size-3" />
              ) : item.source === "recipe" ? (
                <ChefHat className="size-3" />
              ) : (
                <Tag className="size-3" />
              )}
              {SOURCE_LABELS[item.source] ?? item.source}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {(item.quantity != null || item.unit) && (
            <span>
              {item.quantity ?? ""}
              {item.unit ? ` ${item.unit}` : ""}
            </span>
          )}
          {item.unit_price != null && (
            <span>{formatShoppingMoney(item.unit_price)}</span>
          )}
          {(item.estimated_savings ?? 0) > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              −{formatShoppingMoney(item.estimated_savings ?? 0)}
            </span>
          )}
          {item.recipe_id && (
            <Link
              href={`/app/recipes/${item.recipe_id}`}
              className="text-primary hover:underline"
            >
              Ver receita
            </Link>
          )}
        </div>
      </div>

      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Remover"
        className="text-destructive hover:text-destructive"
        disabled={deleting}
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
