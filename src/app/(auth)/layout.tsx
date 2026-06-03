import type { Metadata } from "next";
import Link from "next/link";
import { ChefHat } from "lucide-react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Autenticação",
  robots: { index: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <header className="relative border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-sm font-semibold"
          >
            <ChefHat className="size-4 text-primary" />
            {siteConfig.name}
          </Link>
        </div>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
