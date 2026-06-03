"use client";

import { useState } from "react";
import { Check, Package, Pencil, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeletePantryItem, useUpdatePantryItem } from "@/hooks/use-api";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";
import {
  formatExpiryLabel,
  getExpiryStatus,
  toDateInputValue,
} from "@/lib/utils/pantry";
import type { PantryItem } from "@/types/database";

type PantryItemRowProps = {
  item: PantryItem;
};

export function PantryItemRow({ item }: PantryItemRowProps) {
  const updateItem = useUpdatePantryItem();
  const deleteItem = useDeletePantryItem();
  const { confirm, dialog } = useConfirmDialog();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(
    item.quantity != null ? String(item.quantity) : "",
  );
  const [unit, setUnit] = useState(item.unit ?? "");
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(item.expires_at));
  const [isLeftover, setIsLeftover] = useState(item.item_kind === "leftover");
  const [notes, setNotes] = useState(item.notes ?? "");

  const expiryStatus = getExpiryStatus(item.expires_at);
  const expiryLabel = formatExpiryLabel(item.expires_at);

  function resetForm() {
    setName(item.name);
    setQuantity(item.quantity != null ? String(item.quantity) : "");
    setUnit(item.unit ?? "");
    setExpiresAt(toDateInputValue(item.expires_at));
    setIsLeftover(item.item_kind === "leftover");
    setNotes(item.notes ?? "");
  }

  async function handleSave() {
    await updateItem.mutateAsync({
      id: item.id,
      data: {
        name: name.trim(),
        quantity: quantity ? Number(quantity) : undefined,
        unit: unit.trim() || undefined,
        expiresAt: expiresAt || undefined,
        itemKind: isLeftover ? "leftover" : "stock",
        notes: notes.trim() || undefined,
      },
    });
    setEditing(false);
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Remover item?",
      description: `"${item.name}" será removido da despensa.`,
      confirmLabel: "Remover",
      destructive: true,
    });
    if (!confirmed) return;
    await deleteItem.mutateAsync(item.id);
  }

  if (editing) {
    return (
      <>
        <li className="surface-card space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`name-${item.id}`}>Nome</Label>
              <Input
                id={`name-${item.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`qty-${item.id}`}>Quantidade</Label>
              <Input
                id={`qty-${item.id}`}
                type="number"
                min={0}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`unit-${item.id}`}>Unidade</Label>
              <Input
                id={`unit-${item.id}`}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ex: kg, un, L"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`exp-${item.id}`}>Validade</Label>
              <Input
                id={`exp-${item.id}`}
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id={`leftover-${item.id}`}
                type="checkbox"
                checked={isLeftover}
                onChange={(e) => setIsLeftover(e.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              <Label htmlFor={`leftover-${item.id}`}>Sobra</Label>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`notes-${item.id}`}>Notas</Label>
              <Input
                id={`notes-${item.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contexto para reaproveitamento"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!name.trim() || updateItem.isPending}
              onClick={handleSave}
            >
              <Check className="size-3.5" />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                resetForm();
                setEditing(false);
              }}
            >
              <X className="size-3.5" />
              Cancelar
            </Button>
          </div>
        </li>
        {dialog}
      </>
    );
  }

  return (
    <>
      <li className="surface-card flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.quantity != null && (
                <span className="text-xs text-muted-foreground">
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                </span>
              )}
              {expiryLabel && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    expiryStatus === "expired" &&
                      "border-destructive/40 bg-destructive/10 text-destructive",
                    expiryStatus === "soon" &&
                      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                  )}
                >
                  {expiryLabel}
                </Badge>
              )}
              {item.item_kind === "leftover" && (
                <Badge variant="secondary" className="text-[10px]">
                  Sobra
                </Badge>
              )}
              {item.notes && (
                <span className="text-[10px] text-muted-foreground">
                  {item.notes}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Editar"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            aria-label="Remover"
            disabled={deleteItem.isPending}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </li>
      {dialog}
    </>
  );
}
