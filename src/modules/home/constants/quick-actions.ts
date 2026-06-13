import {
  CalendarDays,
  ClipboardList,
  LineChart,
  MessageCircle,
  Percent,
  Refrigerator,
  Scale,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import type { HomeQuickAction } from "@/modules/home/types";

export const HOME_QUICK_ACTIONS: HomeQuickAction[] = [
  {
    id: "generate",
    label: "Gerar",
    description: "Receita com IA",
    href: "/app/generate",
    accent: "primary",
  },
  {
    id: "shopping",
    label: "Compras",
    description: "Lista inteligente",
    href: "/app/shopping",
    accent: "amber",
  },
  {
    id: "offers",
    label: "Ofertas",
    description: "Promoções na região",
    href: "/app/offers",
    accent: "rose",
  },
  {
    id: "monthly-purchases",
    label: "Do mês",
    description: "Gastos fixos",
    href: "/compras-do-mes",
    accent: "sky",
  },
  {
    id: "compare",
    label: "Comparar",
    description: "Preços regionais",
    href: "/app/compare",
    accent: "emerald",
  },
  {
    id: "weekly-plan",
    label: "Plano semanal",
    description: "7 dias + lista",
    href: "/app/weekly-plan",
    accent: "violet",
  },
  {
    id: "economy",
    label: "Economia",
    description: "Seus números",
    href: "/app/economy",
    accent: "emerald",
  },
  {
    id: "pantry",
    label: "Despensa",
    description: "Seus ingredientes",
    href: "/app/pantry",
    accent: "sky",
  },
  {
    id: "chat",
    label: "Chat IA",
    description: "Tire dúvidas",
    href: "/app/chat",
    accent: "violet",
  },
];

export const HOME_QUICK_ACTION_ICONS = {
  generate: Sparkles,
  shopping: ShoppingCart,
  "monthly-purchases": ClipboardList,
  compare: Scale,
  offers: Percent,
  pantry: Refrigerator,
  chat: MessageCircle,
  "weekly-plan": CalendarDays,
  economy: LineChart,
} as const;

export const HOME_ACCENT_CLASSES: Record<HomeQuickAction["accent"], string> = {
  primary: "from-primary/15 to-primary/5 text-primary",
  amber: "from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-400",
  emerald:
    "from-emerald-500/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  sky: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-400",
  rose: "from-rose-500/15 to-rose-500/5 text-rose-700 dark:text-rose-400",
  violet:
    "from-violet-500/15 to-violet-500/5 text-violet-700 dark:text-violet-400",
};
