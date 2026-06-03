"use client";

import { useCallback, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MonthlyPurchaseFormFields } from "@/modules/monthly-purchases/components/monthly-purchase-form-fields";
import { MonthlyPurchaseSaveStatus } from "@/modules/monthly-purchases/components/monthly-purchase-save-status";
import type { MonthlyQuickItem } from "@/modules/monthly-purchases/constants/quick-items";
import {
  emptyMonthlyForm,
  formValuesToInput,
  useMonthlyPurchaseForm,
  type MonthlyPurchaseFormValues,
} from "@/modules/monthly-purchases/hooks/use-monthly-purchase-form";
import { useMonthlyItemAutosave } from "@/modules/monthly-purchases/hooks/use-monthly-item-autosave";
import type { MonthShoppingItem } from "@/modules/monthly-purchases/types";
import type { MonthPurchaseItemUpdateInput } from "@/lib/validations/monthly-purchases";

function itemToFormValues(item: MonthShoppingItem): MonthlyPurchaseFormValues {
  return {
    name: item.name,
    category: item.category,
    quantity: item.quantity != null ? String(item.quantity) : "",
    unit: item.unit ?? "un",
    pricePaid: item.price_paid != null ? String(item.price_paid) : "",
    notes: item.notes ?? "",
    isPurchased: item.is_purchased,
  };
}

type MonthlyPurchaseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item?: MonthShoppingItem | null;
  quickPreset?: MonthlyQuickItem | null;
  saving?: boolean;
  onCreate: (values: MonthlyPurchaseFormValues) => void | Promise<void>;
  onAutoSave?: (payload: MonthPurchaseItemUpdateInput) => Promise<void>;
};

export function MonthlyPurchaseFormDialog({
  open,
  onOpenChange,
  mode,
  item,
  quickPreset,
  saving,
  onCreate,
  onAutoSave,
}: MonthlyPurchaseFormDialogProps) {
  const {
    reset,
    values,
    errors,
    showDetails,
    setShowDetails,
    setField,
    validate,
  } = useMonthlyPurchaseForm();
  const isEdit = mode === "edit" && Boolean(item);
  const lastInitKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      lastInitKeyRef.current = null;
      return;
    }

    const initKey =
      item?.id ?? (quickPreset ? `preset:${quickPreset.name}` : "new");

    if (lastInitKeyRef.current === initKey) return;
    lastInitKeyRef.current = initKey;

    if (item) {
      reset(itemToFormValues(item));
    } else if (quickPreset) {
      reset({
        ...emptyMonthlyForm(),
        name: quickPreset.name,
        category: quickPreset.category,
        unit: quickPreset.unit ?? "un",
      });
    } else {
      reset();
    }
  }, [open, item, quickPreset, reset]);

  const autosavePayload: MonthPurchaseItemUpdateInput = {
    name: values.name.trim(),
    category: values.category,
    quantity: values.quantity ? Number(values.quantity) : null,
    unit: values.unit.trim() || null,
    price_paid: values.pricePaid ? Number(values.pricePaid) : null,
    notes: values.notes.trim() || null,
    is_purchased: values.isPurchased,
  };

  const handleAutosave = useCallback(
    async (payload: MonthPurchaseItemUpdateInput) => {
      if (!onAutoSave) return;
      await onAutoSave(payload);
    },
    [onAutoSave],
  );

  const { status: autosaveStatus } = useMonthlyItemAutosave({
    enabled: isEdit && Boolean(onAutoSave) && values.name.trim().length > 0,
    itemId: item?.id ?? null,
    payload: autosavePayload,
    onSave: handleAutosave,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      await handleAutosave(formValuesToInput(values));
      onOpenChange(false);
      return;
    }

    await onCreate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar item" : "Adicionar à lista do mês"}
            </DialogTitle>
            <DialogDescription>
              Preencha o básico e salve. Na edição, suas alterações são salvas
              sozinhas enquanto você digita.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <MonthlyPurchaseFormFields
              values={values}
              errors={errors}
              showDetails={showDetails}
              onToggleDetails={() => setShowDetails(!showDetails)}
              onChange={setField}
              showPurchasedToggle
            />
            {isEdit && (
              <MonthlyPurchaseSaveStatus
                status={autosaveStatus}
                className="mt-3"
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            {!isEdit && (
              <Button type="submit" disabled={saving}>
                Adicionar à lista
              </Button>
            )}
            {isEdit && autosaveStatus === "error" && (
              <Button type="submit" disabled={saving}>
                Tentar salvar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
