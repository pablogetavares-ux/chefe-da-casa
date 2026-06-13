import Link from "next/link";
import { ChefHat } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { MARKETING_LANDING } from "@/config/marketing-landing";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const anchorLinks = MARKETING_LANDING.nav;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4 sm:h-16">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-heading text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ChefHat className="size-4" />
          </span>
          <span className="max-w-[9rem] truncate sm:max-w-none sm:overflow-visible">
            {siteConfig.name}
          </span>
        </Link>
        <nav
          aria-label="Principal"
          className="flex min-w-0 items-center gap-1 sm:gap-2"
        >
          <div className="hidden items-center gap-0.5 lg:flex">
            {anchorLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
          <Link href="/login">
            <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="ml-0.5 shrink-0 shadow-sm sm:ml-1">
              <span className="hidden sm:inline">Começar grátis</span>
              <span className="sm:hidden">Começar</span>
            </Button>
          </Link>
        </nav>
      </div>

      <nav
        aria-label="Seções da página"
        className="container mx-auto flex gap-1 overflow-x-auto px-4 pb-2.5 lg:hidden"
      >
        {anchorLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
              "hover:border-primary/30 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
