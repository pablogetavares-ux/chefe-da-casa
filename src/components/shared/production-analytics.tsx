"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** Analytics Vercel — ativo só em produção (zero config na Vercel). */
export function ProductionAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
