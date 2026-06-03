"use client";

import type { AdminTabId } from "@/modules/admin/types";
import { cn } from "@/lib/utils";

const TABS: { id: AdminTabId; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "users", label: "Usuários" },
  { id: "offers", label: "Ofertas" },
  { id: "activity", label: "Atividade" },
  { id: "system", label: "Sistema" },
];

type AdminShellProps = {
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
  children: React.ReactNode;
};

export function AdminShell({
  activeTab,
  onTabChange,
  children,
}: AdminShellProps) {
  return (
    <div className="space-y-6">
      <nav
        className="flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-1"
        aria-label="Seções do painel admin"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "min-h-10 shrink-0 rounded-lg px-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}
