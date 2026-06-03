"use client";

import Link from "next/link";
import { useState } from "react";
import { Package, Plus } from "lucide-react";

import { PantryItemRow } from "@/components/features/pantry/pantry-item-row";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatePantryItem, usePantryItems } from "@/hooks/use-api";
import { getExpiryStatus } from "@/lib/utils/pantry";

export function PantryPanel() {
  const { data: items, isLoading, error } = usePantryItems();
  const createItem = useCreatePantryItem();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isLeftover, setIsLeftover] = useState(false);
  const [notes, setNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createItem.mutateAsync({
      name: name.trim(),
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit.trim() || undefined,
      expiresAt: expiresAt || undefined,
      itemKind: isLeftover ? "leftover" : "stock",
      notes: notes.trim() || undefined,
    });

    setName("");
    setQuantity("");
    setUnit("");
    setExpiresAt("");
    setIsLeftover(false);
    setNotes("");
    setShowDetails(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback
        compact
        title="Erro ao carregar despensa"
        message={error.message}
      />
    );
  }

  const expiringSoon =
    items?.filter((item) => getExpiryStatus(item.expires_at) === "soon")
      .length ?? 0;

  return (
    <div className="space-y-6">
      {expiringSoon > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between dark:text-amber-300">
          <span>
            {expiringSoon} item{expiringSoon !== 1 ? "s" : ""} vence
            {expiringSoon !== 1 ? "m" : ""} nos próximos 3 dias.
          </span>
          <Link href="/app/anti-waste">
            <Button size="sm" variant="outline" className="h-8">
              Evite desperdício
            </Button>
          </Link>
        </div>
      )}

      <form onSubmit={handleAdd} className="surface-card space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: tomate, arroz, frango..."
            disabled={createItem.isPending}
            className="h-11 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:px-4"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Menos opções" : "Mais opções"}
          </Button>
          <Button
            type="submit"
            disabled={createItem.isPending || !name.trim()}
            className="h-11 gap-2 sm:px-6"
          >
            <Plus className="size-4" />
            {createItem.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </div>

        {showDetails && (
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-qty">Quantidade</Label>
              <Input
                id="new-qty"
                type="number"
                min={0}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-unit">Unidade</Label>
              <Input
                id="new-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, un, L..."
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-exp">Validade</Label>
              <Input
                id="new-exp"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-3">
              <input
                id="new-leftover"
                type="checkbox"
                checked={isLeftover}
                onChange={(e) => setIsLeftover(e.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              <Label htmlFor="new-leftover">É sobra / prato pronto</Label>
            </div>
            {isLeftover && (
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="new-notes">Detalhes da sobra</Label>
                <Input
                  id="new-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: feijão de ontem, frango assado sobrando..."
                />
              </div>
            )}
          </div>
        )}
      </form>

      {items && items.length > 0 ? (
        <ul className="grid gap-2">
          {items.map((item) => (
            <PantryItemRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Package}
          title="Despensa vazia"
          description="Adicione ingredientes para começar a gerar receitas personalizadas com IA."
        />
      )}
    </div>
  );
}
