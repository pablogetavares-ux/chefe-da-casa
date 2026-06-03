"use client";

import { useCallback, useState } from "react";

import {
  validateMonthPurchaseForm,
  type MonthPurchaseFormInput,
} from "@/lib/validations/monthly-purchases";
import type { MonthPurchaseCategory } from "@/modules/monthly-purchases/types";

export type MonthlyPurchaseFormValues = {
  name: string;
  category: MonthPurchaseCategory;
  quantity: string;
  unit: string;
  pricePaid: string;
  notes: string;
  isPurchased: boolean;
};

export const emptyMonthlyForm = (): MonthlyPurchaseFormValues => ({
  name: "",
  category: "MERCEARIA",
  quantity: "",
  unit: "un",
  pricePaid: "",
  notes: "",
  isPurchased: false,
});

export function formValuesToInput(
  values: MonthlyPurchaseFormValues,
): MonthPurchaseFormInput {
  return {
    name: values.name,
    category: values.category,
    quantity: values.quantity ? Number(values.quantity) : null,
    unit: values.unit.trim() || null,
    price_paid: values.pricePaid ? Number(values.pricePaid) : null,
    notes: values.notes.trim() || null,
    is_purchased: values.isPurchased,
  };
}

export function useMonthlyPurchaseForm(
  initial?: Partial<MonthlyPurchaseFormValues>,
) {
  const [values, setValues] = useState<MonthlyPurchaseFormValues>({
    ...emptyMonthlyForm(),
    ...initial,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDetails, setShowDetails] = useState(
    Boolean(initial?.quantity || initial?.notes),
  );

  const setField = useCallback(
    <K extends keyof MonthlyPurchaseFormValues>(
      key: K,
      value: MonthlyPurchaseFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const reset = useCallback((next?: Partial<MonthlyPurchaseFormValues>) => {
    setValues({ ...emptyMonthlyForm(), ...next });
    setErrors({});
    setShowDetails(Boolean(next?.quantity || next?.notes));
  }, []);

  const validate = useCallback(() => {
    const result = validateMonthPurchaseForm(formValuesToInput(values));
    if (!result.success) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  }, [values]);

  return {
    values,
    setValues,
    setField,
    errors,
    showDetails,
    setShowDetails,
    reset,
    validate,
  };
}
