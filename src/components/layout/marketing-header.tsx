import Link from "next/link";
import { ChefHat } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/pricing", label: "Planos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ChefHat className="size-4" />
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/login">
            <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="ml-1 shadow-sm">
              Começar grátis
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
