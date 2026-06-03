"use client";

import { useEffect, useRef, useState } from "react";

import type { MonthPurchaseItemUpdateInput } from "@/lib/validations/monthly-purchases";

type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type UseMonthlyItemAutosaveOptions = {
  enabled: boolean;
  itemId: string | null;
  payload: MonthPurchaseItemUpdateInput;
  onSave: (payload: MonthPurchaseItemUpdateInput) => Promise<void>;
  delayMs?: number;
};

export function useMonthlyItemAutosave({
  enabled,
  itemId,
  payload,
  onSave,
  delayMs = 900,
}: UseMonthlyItemAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const firstRun = useRef(true);
  const mountedRef = useRef(true);
  const savedTimerRef = useRef<number | null>(null);
  const payloadJson = JSON.stringify(payload);
  const autosaveActive = enabled && Boolean(itemId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (savedTimerRef.current !== null) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    firstRun.current = true;
  }, [itemId]);

  useEffect(() => {
    if (!autosaveActive) {
      return;
    }

    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setStatus("pending");
    const timer = window.setTimeout(() => {
      void (async () => {
        if (!mountedRef.current) return;
        setStatus("saving");
        try {
          await onSave(payload);
          if (!mountedRef.current) return;
          setStatus("saved");
          savedTimerRef.current = window.setTimeout(() => {
            if (mountedRef.current) setStatus("idle");
          }, 2000);
        } catch {
          if (mountedRef.current) setStatus("error");
        }
      })();
    }, delayMs);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- payloadJson serializes payload
  }, [autosaveActive, itemId, payloadJson, onSave, delayMs]);

  return { status: autosaveActive ? status : "idle" };
}
