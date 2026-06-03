"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { WeeklyPlanBodyInput } from "@/lib/validations/weekly-plan";
import {
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";

export function useGenerateWeeklyPlan() {
  return useMutation({
    mutationFn: (input: WeeklyPlanBodyInput) =>
      api.weeklyPlan.generatePost(input),
    onSuccess: () => {
      toastMutationSuccess("Plano semanal gerado!");
    },
    onError: toastMutationError,
  });
}
