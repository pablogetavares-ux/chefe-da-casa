import { NextResponse } from "next/server";

import { canAccessDetailedOps } from "@/lib/api/ops-access";
import { createClient } from "@/lib/supabase/server";
import { getProductionReadiness } from "@/lib/runtime/production-readiness";

const isProd = process.env.NODE_ENV === "production";

function sanitizeCheck(value: string) {
  if (!isProd) return value;
  return value.startsWith("error") ? "error" : value;
}

/**
 * Health check — valida app + conectividade Supabase.
 * Em produção, detalhes de prontidão só para admin autenticado.
 */
export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  const readiness = getProductionReadiness();
  const detailed = await canAccessDetailedOps(request);

  const checks: Record<string, string> = {
    app: "ok",
    supabase: "unknown",
    database: "unknown",
  };

  if (detailed) {
    Object.assign(checks, {
      serviceRole: readiness.services.serviceRole ? "configured" : "missing",
      openai: readiness.services.openai ? "configured" : "missing",
      stripe: readiness.services.stripe ? "configured" : "missing",
      upstash: readiness.services.upstash ? "configured" : "missing",
      monitoring: readiness.services.sentry ? "sentry" : "logs-only",
      aiMock: readiness.mocks.aiDevMock ? "enabled" : "disabled",
      billingMock: readiness.mocks.billingDevMock ? "enabled" : "disabled",
    });
  }

  try {
    const supabase = await createClient();

    const { error: authError } = await supabase.auth.getSession();
    checks.supabase = sanitizeCheck(
      authError ? `error: ${authError.message}` : "ok",
    );

    const { error: dbError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    checks.database = sanitizeCheck(
      dbError ? `error: ${dbError.message}` : "ok",
    );
  } catch {
    checks.supabase = "error";
    checks.database = "error";

    if (!detailed) {
      return NextResponse.json(
        {
          status: "degraded",
          service: "chef-da-casa-ai",
          timestamp,
          checks,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        status: "degraded",
        service: "chef-da-casa-ai",
        timestamp,
        checks,
        readiness: {
          readyForAi: readiness.readyForAi,
          readyForBilling: readiness.readyForBilling,
          readyForProduction: readiness.readyForProduction,
          blockers: readiness.blockers,
          warnings: readiness.warnings,
        },
      },
      { status: 503 },
    );
  }

  const coreOk =
    checks.app === "ok" && checks.supabase === "ok" && checks.database === "ok";

  const status =
    coreOk && (!isProd || readiness.blockers.length === 0) ? "ok" : "degraded";

  if (!detailed) {
    return NextResponse.json(
      {
        status,
        service: "chef-da-casa-ai",
        timestamp,
        checks,
      },
      { status: coreOk ? 200 : 503 },
    );
  }

  return NextResponse.json(
    {
      status,
      readyForAi: readiness.readyForAi,
      readyForBilling: readiness.readyForBilling,
      readyForProduction: readiness.readyForProduction,
      monitoring: checks.monitoring,
      service: "chef-da-casa-ai",
      timestamp,
      checks,
      blockers: readiness.blockers,
      warnings: readiness.warnings,
    },
    { status: coreOk ? 200 : 503 },
  );
}
