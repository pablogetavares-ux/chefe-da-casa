import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Leaf,
  LineChart,
  MessageCircle,
  Percent,
  Refrigerator,
  Scale,
  Shield,
  ShoppingCart,
  Sparkles,
  User,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  adminOnly?: boolean;
};

export const primaryNavItems: NavItem[] = [
  { href: "/app", label: "Início", icon: LayoutDashboard, mobile: true },
  { href: "/app/pantry", label: "Despensa", icon: Refrigerator, mobile: false },
  {
    href: "/app/anti-waste",
    label: "Evite desperdício",
    icon: Leaf,
    mobile: false,
  },
  {
    href: "/app/generate",
    label: "Gerar receita",
    icon: Sparkles,
    mobile: true,
  },
  { href: "/app/recipes", label: "Receitas", icon: BookOpen, mobile: false },
  {
    href: "/app/favorites",
    label: "Favoritas",
    icon: Heart,
    mobile: true,
  },
  {
    href: "/app/shopping",
    label: "Compras",
    icon: ShoppingCart,
    mobile: true,
  },
  {
    href: "/compras-do-mes",
    label: "Compras do Mês",
    icon: ClipboardList,
    mobile: true,
  },
  {
    href: "/app/offers",
    label: "Ofertas",
    icon: Percent,
    mobile: true,
  },
  {
    href: "/app/compare",
    label: "Comparar",
    icon: Scale,
    mobile: true,
  },
  {
    href: "/app/weekly-plan",
    label: "Plano semanal",
    icon: CalendarDays,
    mobile: true,
  },
  {
    href: "/app/economy",
    label: "Economia",
    icon: LineChart,
    mobile: true,
  },
  { href: "/app/chat", label: "Chat IA", icon: MessageCircle, mobile: true },
  { href: "/app/profile", label: "Perfil", icon: User, mobile: true },
];

export const adminNavItem: NavItem = {
  href: "/app/admin",
  label: "Admin",
  icon: Shield,
  adminOnly: true,
};

export const bottomNavItems: NavItem[] = [
  { href: "/app", label: "Início", icon: LayoutDashboard },
  { href: "/app/generate", label: "Gerar", icon: Sparkles },
  { href: "/app/offers", label: "Ofertas", icon: Percent },
  { href: "/app/shopping", label: "Compras", icon: ShoppingCart },
  { href: "/app/profile", label: "Perfil", icon: User },
];

export const mobileNavItems = primaryNavItems.filter((item) => item.mobile);

export function isNavActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  if (href === "/compras-do-mes") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
