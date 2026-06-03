import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";

import { SHOPPING_CATEGORY_LABELS } from "@/modules/shopping/constants/categories";
import type { HomeShoppingPreview } from "@/modules/home/types";
import type { ShoppingItemCategory } from "@/modules/shopping/types";

type HomeShoppingWeekProps = {
  shopping: HomeShoppingPreview | null;
};

export function HomeShoppingWeek({ shopping }: HomeShoppingWeekProps) {
  if (!shopping || shopping.pendingCount === 0) {
    return (
      <div className="surface-card rounded-2xl border border-dashed p-5 text-center">
        <ShoppingCart className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Lista da semana vazia</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Adicione itens ou importe de uma receita.
        </p>
        <Link
          href="/app/shopping"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Abrir lista inteligente
        </Link>
      </div>
    );
  }

  const compareHref = `/app/compare?listId=${shopping.listId}`;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="font-medium">{shopping.listName}</p>
          <p className="text-xs text-muted-foreground">
            {shopping.pendingCount} itens pendentes
          </p>
        </div>
        <Link
          href={compareHref}
          className="text-xs font-medium text-primary hover:underline"
        >
          Comparar preços
        </Link>
      </div>
      <ul className="divide-y">
        {shopping.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded border border-border" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {SHOPPING_CATEGORY_LABELS[
                  item.category as ShoppingItemCategory
                ] ?? item.category}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {shopping.pendingCount > shopping.items.length ? (
        <div className="border-t px-4 py-2 text-center text-xs text-muted-foreground">
          +{shopping.pendingCount - shopping.items.length} itens
        </div>
      ) : null}
      <div className="border-t px-4 py-3">
        <Link
          href="/app/shopping"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Check className="size-4" />
          Ver lista completa
        </Link>
      </div>
    </div>
  );
}
