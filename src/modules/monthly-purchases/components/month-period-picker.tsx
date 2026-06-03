"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  currentPeriod,
  isCurrentPeriod,
  periodLabel,
  shiftPeriod,
} from "@/modules/monthly-purchases/constants/period";
import { cn } from "@/lib/utils";

type MonthPeriodPickerProps = {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  className?: string;
};

export function MonthPeriodPicker({
  month,
  year,
  onChange,
  className,
}: MonthPeriodPickerProps) {
  const isCurrent = isCurrentPeriod(month, year);
  const now = currentPeriod();
  const isFuture = year > now.year || (year === now.year && month > now.month);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center rounded-xl border bg-card shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mês anterior"
          onClick={() => {
            const prev = shiftPeriod(month, year, -1);
            onChange(prev.month, prev.year);
          }}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="min-w-[140px] px-2 text-center">
          <p className="font-heading text-base font-semibold sm:text-lg">
            {periodLabel(month, year)}
          </p>
          {!isCurrent && (
            <p className="text-xs text-muted-foreground">
              {isFuture ? "Próximo período" : "Período passado"}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Próximo mês"
          onClick={() => {
            const next = shiftPeriod(month, year, 1);
            onChange(next.month, next.year);
          }}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
      {!isCurrent && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(now.month, now.year)}
        >
          Ir para este mês
        </Button>
      )}
    </div>
  );
}
