"use client";

import { SHOPPING_CATEGORY_LABELS } from "@/modules/shopping/constants/categories";
import type { ShoppingItemCategory } from "@/modules/shopping/types";
import type { SmartShoppingListItem } from "@/modules/shopping/types";

import { ShoppingItemRow } from "./shopping-item-row";

type ShoppingCategorySectionProps = {
  category: ShoppingItemCategory;
  items: SmartShoppingListItem[];
  onToggle: (id: string, isChecked: boolean) => void;
  onDelete: (id: string) => void;
  toggling?: boolean;
  deleting?: boolean;
};

export function ShoppingCategorySection({
  category,
  items,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: ShoppingCategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {SHOPPING_CATEGORY_LABELS[category]}
      </h3>
      <ul className="grid gap-2">
        {items.map((item) => (
          <ShoppingItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onDelete={onDelete}
            toggling={toggling}
            deleting={deleting}
          />
        ))}
      </ul>
    </section>
  );
}
