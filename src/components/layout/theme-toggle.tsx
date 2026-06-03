"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/lib/theme-client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  /** Ícone compacto ou botão com texto (recomendado no painel). */
  variant?: "icon" | "labeled";
  className?: string;
};

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <Button
        type="button"
        variant={variant === "labeled" ? "outline" : "ghost"}
        size={variant === "labeled" ? "sm" : "icon-sm"}
        className={cn(
          variant === "labeled" ? "w-full gap-2" : undefined,
          "pointer-events-none",
          className,
        )}
        aria-hidden
        tabIndex={-1}
      >
        <span className="size-4 shrink-0 rounded-sm bg-muted" />
        {variant === "labeled" && (
          <span className="h-4 w-20 rounded-sm bg-muted" />
        )}
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const activateLight = () => setTheme("light");
  const activateDark = () => setTheme("dark");

  if (variant === "labeled") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("w-full gap-2", className)}
        onClick={() => (isDark ? activateLight() : activateDark())}
      >
        {isDark ? (
          <>
            <Sun className="size-4 shrink-0" />
            Modo claro
          </>
        ) : (
          <>
            <Moon className="size-4 shrink-0" />
            Modo escuro
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={className}
      onClick={() => (isDark ? activateLight() : activateDark())}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}
