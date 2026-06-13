"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LogOut, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AiUsageMeter } from "@/components/shared/ai-usage-meter";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  adminNavItem,
  bottomNavItems,
  isNavActive,
  primaryNavItems,
  type NavItem,
} from "@/config/navigation";
import { formatPlanDisplayName } from "@/config/plans";
import { useFocusTrap } from "@/hooks/use-focus-trap";
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
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { data: profile } = useProfile();
  const { data: access } = useAdminAccess();

  const showAdmin =
    isAdmin || Boolean(profile?.isAdmin) || Boolean(access?.isAdmin);

  const navItems: NavItem[] = [
    ...primaryNavItems,
    ...(showAdmin ? [adminNavItem] : []),
  ];

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useFocusTrap(mobileOpen, drawerRef, {
    onEscape: closeMobile,
    restoreFocusRef: menuButtonRef,
  });

  const planLabel = plan ? formatPlanDisplayName(plan) : null;

  return (
    <>
      <aside className="hidden md:flex md:min-h-full md:w-64 md:flex-col md:border-r md:bg-sidebar">
        <SidebarHeader
          userName={userName}
          userEmail={userEmail}
          plan={planLabel}
        />
        <NavLinks
          items={navItems}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
        <SidebarFooter logoutAction={logoutAction} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-sidebar pt-[env(safe-area-inset-top)] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-sidebar-border p-4">
              <SidebarHeader
                userName={userName}
                userEmail={userEmail}
                plan={planLabel}
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

      {/* Mobile top bar — tema integrado (sem barra extra no topo) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md md:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ChefHat className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold">
              Chefe da Casa
            </p>
            {planLabel && (
              <p className="truncate text-xs text-muted-foreground">
                {planLabel}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <Button
            ref={menuButtonRef}
            size="icon-sm"
            variant="outline"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navegação principal mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="flex items-stretch justify-around px-1 py-1.5">
          {bottomNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon
                  className={cn("size-5 shrink-0", active && "scale-110")}
                />
                <span className="max-w-full truncate">{item.label}</span>
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
            Chefe da Casa
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {userName ?? userEmail ?? "Chef"}
          </p>
        </div>
      </div>
      {plan && (
        <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
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
