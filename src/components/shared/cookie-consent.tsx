"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chef-cookie-consent";

type ConsentValue = "accepted" | "essential";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

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
        "fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur",
        "md:left-auto md:right-4 md:bottom-4 md:max-w-md md:rounded-xl md:border",
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
        <Button size="sm" onClick={() => save("accepted")}>
          Aceitar
        </Button>
        <Button size="sm" variant="outline" onClick={() => save("essential")}>
          Apenas essenciais
        </Button>
      </div>
    </div>
  );
}
