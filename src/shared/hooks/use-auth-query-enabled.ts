"use client";

import { useAuth } from "@/hooks/use-auth";

/**
 * Evita fetch em APIs protegidas antes do Supabase restaurar a sessão no client
 * (causa comum de 401 no log do dev server).
 */
export function useAuthQueryEnabled(required = true): boolean {
  const { user, loading } = useAuth();
  return required && !loading && Boolean(user);
}
