import { env } from "@/config/env";
import { supabase } from "@/lib/supabase";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("UNAUTHORIZED");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchMobileBillingStatus() {
  const headers = await authHeaders();
  const response = await fetch(`${env.apiUrl}/api/v1/billing/mobile/status`, {
    headers,
  });
  const json = (await response.json()) as ApiResponse<{
    plan: string;
    isPremium: boolean;
    limits: Record<string, number>;
    mobileSubscription: Record<string, unknown> | null;
  }>;

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao carregar plano");
  }
  return json.data;
}

export async function syncMobileBilling() {
  const headers = await authHeaders();
  const response = await fetch(`${env.apiUrl}/api/v1/billing/mobile/sync`, {
    method: "POST",
    headers,
  });
  const json = (await response.json()) as ApiResponse<{
    plan: string;
    isPremium: boolean;
    status: string;
    isTrial: boolean;
    expiresAt: string | null;
  }>;

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao sincronizar assinatura");
  }
  return json.data;
}
