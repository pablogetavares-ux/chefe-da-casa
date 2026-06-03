"use client";

import dynamic from "next/dynamic";

import { AppNavSkeleton } from "./app-nav-skeleton";

const AppNav = dynamic(() => import("./app-nav").then((mod) => mod.AppNav), {
  ssr: false,
  loading: () => <AppNavSkeleton />,
});

type AppNavClientProps = {
  userName?: string | null;
  userEmail?: string | null;
  plan?: string | null;
  isAdmin?: boolean;
  logoutAction: () => Promise<void>;
};

export function AppNavClient(props: AppNavClientProps) {
  return <AppNav {...props} />;
}
