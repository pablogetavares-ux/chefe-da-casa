import Link from "next/link";

import {
  HOME_ACCENT_CLASSES,
  HOME_QUICK_ACTION_ICONS,
  HOME_QUICK_ACTIONS,
} from "@/modules/home/constants/quick-actions";
import { cn } from "@/lib/utils";

export function HomeQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
      {HOME_QUICK_ACTIONS.map((action) => {
        const Icon =
          HOME_QUICK_ACTION_ICONS[
            action.id as keyof typeof HOME_QUICK_ACTION_ICONS
          ];
        return (
          <Link
            key={action.id}
            href={action.href}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-2xl border bg-gradient-to-b p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4",
              HOME_ACCENT_CLASSES[action.accent],
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-background/80 shadow-sm transition-transform group-hover:scale-105">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold leading-tight sm:text-sm">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
