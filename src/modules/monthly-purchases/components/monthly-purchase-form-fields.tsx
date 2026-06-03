"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MONTH_PURCHASE_CATEGORY_LABELS,
  MONTH_PURCHASE_CATEGORY_ORDER,
} from "@/modules/monthly-purchases/constants/categories";
import type { MonthlyPurchaseFormValues } from "@/modules/monthly-purchases/hooks/use-monthly-purchase-form";
import type { MonthPurchaseCategory } from "@/modules/monthly-purchases/types";
import { cn } from "@/lib/utils";

type MonthlyPurchaseFormFieldsProps = {
  values: MonthlyPurchaseFormValues;
  errors: Record<string, string>;
  showDetails: boolean;
  onToggleDetails: () => void;
  onChange: <K extends keyof MonthlyPurchaseFormValues>(
    key: K,
    value: MonthlyPurchaseFormValues[K],
  ) => void;
  showPurchasedToggle?: boolean;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function MonthlyPurchaseFormFields({
  values,
  errors,
  showDetails,
  onToggleDetails,
  onChange,
  showPurchasedToggle = false,
}: MonthlyPurchaseFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mp-name">O que você vai comprar?</Label>
        <Input
          id="mp-name"
          autoFocus
          placeholder="Ex.: Arroz 5kg, detergente…"
          value={values.name}
          aria-invalid={Boolean(errors.name)}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mp-price">Quanto custa? (R$)</Label>
          <Input
            id="mp-price"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={values.pricePaid}
            aria-invalid={Boolean(errors.price_paid)}
            onChange={(e) => onChange("pricePaid", e.target.value)}
          />
          <FieldError message={errors.price_paid} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mp-category">Categoria</Label>
          <select
            id="mp-category"
            className={cn(
              "h-10 w-full rounded-lg border bg-background px-3 text-sm",
              errors.category && "border-destructive",
            )}
            value={values.category}
            onChange={(e) =>
              onChange("category", e.target.value as MonthPurchaseCategory)
            }
          >
            {MONTH_PURCHASE_CATEGORY_ORDER.map((key) => (
              <option key={key} value={key}>
                {MONTH_PURCHASE_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
          <FieldError message={errors.category} />
        </div>
      </div>

      {showPurchasedToggle && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <input
            type="checkbox"
            className="size-5 rounded border-input accent-primary"
            checked={values.isPurchased}
            onChange={(e) => onChange("isPurchased", e.target.checked)}
          />
          <span className="text-sm font-medium">Já comprei este item</span>
        </label>
      )}

      <button
        type="button"
        className="text-sm font-medium text-primary hover:underline"
        onClick={onToggleDetails}
      >
        {showDetails
          ? "Ocultar quantidade e observações"
          : "+ Quantidade e observações"}
      </button>

      {showDetails && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mp-qty">Quantidade</Label>
            <Input
              id="mp-qty"
              type="number"
              min={0}
              step="0.01"
              value={values.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
            />
            <FieldError message={errors.quantity} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mp-unit">Unidade</Label>
            <Input
              id="mp-unit"
              placeholder="un, kg, L, pct"
              value={values.unit}
              onChange={(e) => onChange("unit", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="mp-notes">Observações</Label>
            <Input
              id="mp-notes"
              placeholder="Marca preferida, mercado, promoção…"
              value={values.notes}
              onChange={(e) => onChange("notes", e.target.value)}
            />
            <FieldError message={errors.notes} />
          </div>
        </div>
      )}
    </div>
  );
}
