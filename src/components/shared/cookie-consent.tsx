"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chef-cookie-consent";

type ConsentValue = "accepted" | "essential";

function useAppShellRoute() {
  const pathname = usePathname();
  return (
    pathname?.startsWith("/app") === true ||
    pathname?.startsWith("/compras-do-mes") === true
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const isAppShell = useAppShellRoute();

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setVisible(!localStorage.getItem(STORAGE_KEY));
      } catch {
        setVisible(true);
      }
    });
  }, []);

  const save = (value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className={cn(
        "fixed inset-x-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur",
        "md:left-auto md:right-4 md:bottom-4 md:max-w-md md:rounded-xl md:border",
        isAppShell
          ? "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:bottom-4"
          : "bottom-0 pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        Usamos cookies essenciais para login e, se você aceitar, cookies
        analíticos para melhorar o app. Saiba mais na{" "}
        <Link href="/cookies" className="underline hover:text-foreground">
          política de cookies
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="min-h-11 min-w-[7rem]"
          onClick={() => save("accepted")}
        >
          Aceitar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="min-h-11"
          onClick={() => save("essential")}
        >
          Apenas essenciais
        </Button>
      </div>
    </div>
  );
}
