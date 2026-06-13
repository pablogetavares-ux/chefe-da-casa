"use client";

import { AppNav } from "./app-nav";

type AppNavClientProps = {
  userName?: string | null;
  userEmail?: string | null;
  plan?: string | null;
  isAdmin?: boolean;
  logoutAction: () => Promise<void>;
};

/** Renderiza navegação no SSR com dados do perfil — evita flash do skeleton client-only. */
export function AppNavClient(props: AppNavClientProps) {
  return <AppNav {...props} />;
}
