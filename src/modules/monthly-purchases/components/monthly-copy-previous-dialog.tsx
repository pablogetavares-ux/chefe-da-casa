"use client";

import { Copy, ListPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MonthCopySource } from "@/modules/monthly-purchases/types";
import { cn } from "@/lib/utils";

type MonthlyCopyPreviousDialogProps = {
  open: boolean;
  targetLabel: string;
  sources: MonthCopySource[];
  sourceMonth: number | null;
  sourceYear: number | null;
  onSourceChange: (month: number, year: number) => void;
  copying?: boolean;
  creatingEmpty?: boolean;
  onCopy: () => void;
  onCreateEmpty: () => void;
};

export function MonthlyCopyPreviousDialog({
  open,
  targetLabel,
  sources,
  sourceMonth,
  sourceYear,
  onSourceChange,
  copying,
  creatingEmpty,
  onCopy,
  onCreateEmpty,
}: MonthlyCopyPreviousDialogProps) {
  const busy = copying || creatingEmpty;
  const selected = sources.find(
    (entry) => entry.month === sourceMonth && entry.year === sourceYear,
  );
  const canCopy = Boolean(selected);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copiar lista de outro mês?</DialogTitle>
          <DialogDescription>
            Escolha um mês de {sourceYear ?? "…"} com itens para copiar para{" "}
            {targetLabel}. Preços pagos serão zerados e os itens voltam como
            pendentes.
          </DialogDescription>
        </DialogHeader>

        {sources.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="mp-copy-source">Copiar de</Label>
            <select
              id="mp-copy-source"
              className={cn(
                "h-10 w-full rounded-lg border bg-background px-3 text-sm",
              )}
              value={
                sourceMonth != null && sourceYear != null
                  ? `${sourceYear}-${sourceMonth}`
                  : ""
              }
              disabled={busy}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                if (m && y) onSourceChange(m, y);
              }}
            >
              {sources.map((entry) => (
                <option
                  key={`${entry.year}-${entry.month}`}
                  value={`${entry.year}-${entry.month}`}
                >
                  {entry.label} ({entry.itemCount}{" "}
                  {entry.itemCount === 1 ? "item" : "itens"})
                </option>
              ))}
            </select>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full gap-2"
            disabled={busy || !canCopy}
            onClick={onCopy}
          >
            <Copy className="size-4" />
            {copying
              ? "Copiando…"
              : selected
                ? `Copiar de ${selected.label}`
                : "Copiar lista"}
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            disabled={busy}
            onClick={onCreateEmpty}
          >
            <ListPlus className="size-4" />
            {creatingEmpty ? "Criando…" : "Criar lista vazia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
