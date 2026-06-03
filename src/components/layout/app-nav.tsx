"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { AiUsageMeter } from "@/components/shared/ai-usage-meter";
import { Button } from "@/components/ui/button";
import {
  adminNavItem,
  bottomNavItems,
  isNavActive,
  primaryNavItems,
  type NavItem,
} from "@/config/navigation";
import { useProfile } from "@/hooks/use-api";
import { useAdminAccess } from "@/shared/hooks/api/admin";
import { cn } from "@/lib/utils";

type AppNavProps = {
  userName?: string | null;
  userEmail?: string | null;
  plan?: string | null;
  isAdmin?: boolean;
  logoutAction: () => Promise<void>;
};

export function AppNav({
  userName,
  userEmail,
  plan,
  isAdmin = false,
  logoutAction,
}: AppNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: access } = useAdminAccess();

  const showAdmin =
    isAdmin || Boolean(profile?.isAdmin) || Boolean(access?.isAdmin);

  const navItems: NavItem[] = [
    ...primaryNavItems,
    ...(showAdmin ? [adminNavItem] : []),
  ];

  return (
    <>
      <aside className="hidden md:flex md:min-h-full md:w-64 md:flex-col md:border-r md:bg-sidebar">
        <SidebarHeader userName={userName} userEmail={userEmail} plan={plan} />
        <NavLinks
          items={navItems}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
        <SidebarFooter logoutAction={logoutAction} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b border-sidebar-border p-4">
              <SidebarHeader
                userName={userName}
                userEmail={userEmail}
                plan={plan}
                compact
              />
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Fechar menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <NavLinks
              items={navItems}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <SidebarFooter logoutAction={logoutAction} />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-11 z-40 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ChefHat className="size-4" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">Chef da Casa</p>
            {plan && (
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {plan}
              </p>
            )}
          </div>
        </div>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" />
        </Button>
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navegação principal mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="flex items-stretch justify-around px-1 py-1">
          {bottomNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("size-5", active && "scale-110")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function SidebarHeader({
  userName,
  userEmail,
  plan,
  compact,
}: {
  userName?: string | null;
  userEmail?: string | null;
  plan?: string | null;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div>
        <p className="font-heading text-base font-semibold">Menu</p>
        <p className="truncate text-xs text-muted-foreground">
          {userName ?? userEmail ?? "Chef"}
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-sidebar-border p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ChefHat className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold text-sidebar-foreground">
            Chef da Casa
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {userName ?? userEmail ?? "Chef"}
          </p>
        </div>
      </div>
      {plan && (
        <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
          {plan}
        </span>
      )}
    </div>
  );
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  logoutAction,
}: {
  logoutAction: () => Promise<void>;
}) {
  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="mb-3">
        <AiUsageMeter compact />
      </div>
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          <LogOut className="size-3.5" />
          Sair
        </Button>
      </form>
    </div>
  );
}
