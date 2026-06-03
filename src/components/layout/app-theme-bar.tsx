"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Barra global no topo do painel — alternância claro/escuro acima de sidebar e conteúdo. */
export function AppThemeBar() {
  return (
    <div
      className="sticky top-0 z-50 flex w-full shrink-0 items-center justify-end border-b bg-background/95 px-4 py-2 backdrop-blur-md"
      role="toolbar"
      aria-label="Aparência"
    >
      <ThemeToggle variant="labeled" className="w-auto shrink-0" />
    </div>
  );
}
