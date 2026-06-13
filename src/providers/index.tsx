"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { MotionProvider } from "@/providers/motion-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * Agrupa todos os providers globais da aplicação.
 * Ordem: Motion → Auth → Query → Toaster (ThemeProvider fica em app/layout).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MotionProvider>
      <AuthProvider>
        <QueryProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </AuthProvider>
    </MotionProvider>
  );
}

export { AuthProvider } from "@/providers/auth-provider";
export { QueryProvider } from "@/providers/query-provider";
export { ThemeProvider } from "@/providers/theme-provider";
