"use client";

import { Check, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MONTH_PURCHASE_CATEGORY_LABELS } from "@/modules/monthly-purchases/constants/categories";
import type { MonthShoppingItem } from "@/modules/monthly-purchases/types";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import { cn } from "@/lib/utils";

type MonthlyPurchaseItemRowProps = {
  item: MonthShoppingItem;
  readOnly?: boolean;
  onTogglePurchased: (purchased: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  toggling?: boolean;
  deleting?: boolean;
};

export function MonthlyPurchaseItemRow({
  item,
  readOnly,
  onTogglePurchased,
  onEdit,
  onDelete,
  toggling,
  deleting,
}: MonthlyPurchaseItemRowProps) {
  const meta = [
    MONTH_PURCHASE_CATEGORY_LABELS[item.category],
    item.quantity != null
      ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
      : null,
    item.notes,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "surface-card flex gap-3 p-3 transition-all sm:p-4",
        item.is_purchased && "bg-muted/40 opacity-90",
      )}
    >
      {readOnly ? (
        <div
          aria-hidden
          className={cn(
            "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full border-2",
            item.is_purchased
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-background",
          )}
        >
          {item.is_purchased && <Check className="size-5" strokeWidth={3} />}
        </div>
      ) : (
        <button
          type="button"
          aria-label={
            item.is_purchased ? "Marcar como pendente" : "Marcar como comprado"
          }
          disabled={toggling}
          onClick={() => onTogglePurchased(!item.is_purchased)}
          className={cn(
            "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            item.is_purchased
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-background hover:border-primary",
          )}
        >
          {item.is_purchased && <Check className="size-5" strokeWidth={3} />}
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium leading-snug",
            item.is_purchased && "text-muted-foreground line-through",
          )}
        >
          {item.name}
        </p>
        {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
        {item.is_purchased && (
          <span className="mt-1 inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Comprado
          </span>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        {item.price_paid != null && (
          <span
            className={cn(
              "font-heading text-lg font-semibold tabular-nums",
              item.is_purchased ? "text-muted-foreground" : "text-primary",
            )}
          >
            {formatShoppingMoney(item.price_paid)}
          </span>
        )}
        {!readOnly && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Editar"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Remover"
              disabled={deleting}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
