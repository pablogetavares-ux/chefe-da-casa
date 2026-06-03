"use client";

import { useState } from "react";
import { ListPlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShoppingList } from "@/types/database";
import { cn } from "@/lib/utils";

type ShoppingListSelectorProps = {
  lists: ShoppingList[];
  activeListId?: string;
  onSelect: (listId: string) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete?: (listId: string) => Promise<void>;
  creating?: boolean;
  deleting?: boolean;
};

export function ShoppingListSelector({
  lists,
  activeListId,
  onSelect,
  onCreate,
  onDelete,
  creating,
  deleting,
}: ShoppingListSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("Compras da semana");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setDialogOpen(false);
    setNewName("Compras da semana");
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={activeListId ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className={cn(
            "h-10 min-w-[180px] flex-1 rounded-xl border border-input bg-background px-3 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Selecionar lista de compras"
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setDialogOpen(true)}
        >
          <ListPlus className="size-4" />
          Nova lista
        </Button>

        {onDelete && activeListId && lists.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            disabled={deleting}
            aria-label="Excluir lista atual"
            onClick={() => onDelete(activeListId)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Nova lista de compras</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="list-name">Nome</Label>
              <Input
                id="list-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating || !newName.trim()}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
