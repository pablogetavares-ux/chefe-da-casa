"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Plus, ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupItemsByCategory } from "@/modules/shopping/constants/categories";
import { ShoppingCategorySection } from "@/modules/shopping/components/shopping-category-section";
import { ShoppingItemRow } from "@/modules/shopping/components/shopping-item-row";
import { ShoppingListSelector } from "@/modules/shopping/components/shopping-list-selector";
import { ShoppingOfferMatches } from "@/modules/shopping/components/shopping-offer-matches";
import { ShoppingSavingsBanner } from "@/modules/shopping/components/shopping-savings-banner";
import type { SmartShoppingListItem } from "@/modules/shopping/types";
import {
  useAddFavoritesToShoppingList,
  useAddShoppingListItem,
  useClearCheckedShoppingItems,
  useCreateShoppingList,
  useDeleteShoppingList,
  useDeleteShoppingListItem,
  useLinkOfferToShoppingItem,
  useSmartShopping,
  useToggleShoppingListItem,
} from "@/shared/hooks/api/shopping";

export function SmartShoppingPanel() {
  const {
    data,
    isLoading,
    error,
    lists,
    activeListId,
    setActiveListId,
    listsLoading,
  } = useSmartShopping();

  const addItem = useAddShoppingListItem(activeListId);
  const toggleItem = useToggleShoppingListItem(activeListId);
  const deleteItem = useDeleteShoppingListItem(activeListId);
  const clearChecked = useClearCheckedShoppingItems(activeListId);
  const addFavorites = useAddFavoritesToShoppingList(activeListId);
  const linkOffer = useLinkOfferToShoppingItem(activeListId);
  const createList = useCreateShoppingList();
  const deleteList = useDeleteShoppingList();

  const [name, setName] = useState("");

  const items = useMemo(
    () => (data?.items ?? []) as SmartShoppingListItem[],
    [data?.items],
  );
  const pending = items.filter((item) => !item.is_checked);
  const checked = items.filter((item) => item.is_checked);

  const groupedPending = useMemo(
    () => groupItemsByCategory(items, true),
    [items],
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await addItem.mutateAsync({ name: name.trim() });
    setName("");
  }

  async function handleDeleteList(listId: string) {
    if (!window.confirm("Excluir esta lista e todos os itens?")) return;
    await deleteList.mutateAsync(listId);
  }

  if (isLoading || listsLoading) {
    return (
      <div className="space-y-3">
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback
        compact
        title="Erro ao carregar lista"
        message={error.message}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ShoppingListSelector
        lists={lists}
        activeListId={activeListId}
        onSelect={setActiveListId}
        onCreate={async (listName) => {
          await createList.mutateAsync(listName);
        }}
        onDelete={handleDeleteList}
        creating={createList.isPending}
        deleting={deleteList.isPending}
      />

      {data?.summary && <ShoppingSavingsBanner summary={data.summary} />}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={addFavorites.isPending}
          onClick={() => addFavorites.mutate()}
        >
          <Heart className="size-4" />
          Dos favoritos
        </Button>
        <Link href="/app/recipes">
          <Button variant="outline" size="sm">
            Ver receitas
          </Button>
        </Link>
        <Link href="/app/offers">
          <Button variant="outline" size="sm">
            Central de Ofertas
          </Button>
        </Link>
        <Link
          href={
            activeListId
              ? `/app/compare?listId=${activeListId}`
              : "/app/compare"
          }
        >
          <Button variant="outline" size="sm">
            Comparar preços
          </Button>
        </Link>
      </div>

      <form
        onSubmit={handleAdd}
        className="surface-card flex flex-col gap-3 p-4 sm:flex-row"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: leite, pão, cebola..."
          disabled={addItem.isPending}
          className="h-11 flex-1"
        />
        <Button
          type="submit"
          disabled={addItem.isPending || !name.trim()}
          className="h-11 gap-2 sm:px-6"
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </form>

      {data?.offerMatches && data.offerMatches.length > 0 && (
        <ShoppingOfferMatches
          matches={data.offerMatches}
          linking={linkOffer.isPending}
          personalizationHint={data.offerPersonalizationHint}
          onLink={(itemId, offerId) => linkOffer.mutate({ itemId, offerId })}
        />
      )}

      {items.length > 0 ? (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                A comprar ({pending.length})
              </h2>
              <div className="space-y-5">
                {[...groupedPending.entries()].map(([category, group]) => (
                  <ShoppingCategorySection
                    key={category}
                    category={category}
                    items={group}
                    onToggle={(id, isChecked) =>
                      toggleItem.mutate({ id, isChecked })
                    }
                    onDelete={(id) => deleteItem.mutate(id)}
                    toggling={toggleItem.isPending}
                    deleting={deleteItem.isPending}
                  />
                ))}
              </div>
            </section>
          )}

          {checked.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Comprados ({checked.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={clearChecked.isPending}
                  onClick={() => clearChecked.mutate()}
                >
                  Limpar comprados
                </Button>
              </div>
              <ul className="grid gap-2">
                {checked.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggle={(id, isChecked) =>
                      toggleItem.mutate({ id, isChecked })
                    }
                    onDelete={(id) => deleteItem.mutate(id)}
                    toggling={toggleItem.isPending}
                    deleting={deleteItem.isPending}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Lista vazia"
          description="Adicione itens manualmente, importe dos favoritos ou use uma receita para incluir o que falta na despensa."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => addFavorites.mutate()}
                disabled={addFavorites.isPending}
              >
                Importar dos favoritos
              </Button>
              <Link href="/app/recipes">
                <Button variant="outline">Ver receitas</Button>
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
}
