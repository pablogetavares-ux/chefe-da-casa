import {
  OFFERS_INTEGRATION_POINTS,
  OFFERS_MARKETING,
} from "@/config/offers-experience";

/** Página canônica de planos e checkout (único lugar com grade completa). */
export const MARKETING_PLANS_PAGE = "/pricing" as const;

/** Posicionamento e conteúdo da landing — fonte única para marketing público. */
export const MARKETING_LANDING = {
  tagline: "Receitas, Compras e Economia Inteligente para sua Família.",
  subheadline:
    "Planeje refeições, monte listas de compras e encontre ofertas na sua região — tudo conectado à rotina da sua casa.",
  heroEyebrow: "Cozinha + economia para famílias",

  nav: [
    { href: "/#beneficios", label: "Benefícios" },
    { href: "/#recursos", label: "Recursos" },
    { href: "/#central-ofertas", label: "Ofertas" },
    { href: "/#planos", label: "Planos" },
    { href: "/#faq", label: "FAQ" },
  ] as const,

  heroStats: [
    { value: "10s", label: "para gerar receita" },
    {
      value: OFFERS_MARKETING.heroStat.value,
      label: OFFERS_MARKETING.heroStat.label,
    },
    { value: "1", label: "lista de compras inteligente" },
    { value: "0", label: "desperdício ideal" },
  ] as const,

  benefits: [
    {
      title: "Economia no mercado",
      description:
        "Ofertas de supermercados na sua cidade ligadas à despensa, receitas e lista de compras.",
    },
    {
      title: "Mais tempo em família",
      description:
        "Receitas rápidas com IA, plano semanal e lista pronta — menos decisão, mais rotina.",
    },
    {
      title: "Saúde personalizada",
      description:
        "Preferências dietéticas, modo fitness e perfil familiar respeitados em cada sugestão.",
    },
    {
      title: "Menos desperdício",
      description:
        "Despensa inteligente e modo anti-desperdício para aproveitar o que já está em casa.",
    },
  ] as const,

  resources: [
    {
      step: "01",
      title: "Despensa conectada",
      description:
        "Cadastre ingredientes ou escaneie com a câmera — a base para receitas e compras.",
    },
    {
      step: "02",
      title: "Receitas com IA",
      description:
        "Sugestões saudáveis a partir do que você já tem, com modos fitness, vegano e mais.",
    },
    {
      step: "03",
      title: "Lista de compras",
      description:
        "Itens faltantes organizados por categoria, com promoções da sua região.",
    },
    {
      step: "04",
      title: "Central de Ofertas",
      description:
        "Hub multi-categoria — supermercado, farmácia, pet shop e mais — gratuito no plano Free.",
    },
    {
      step: "05",
      title: "Plano semanal",
      description:
        "Organize refeições da semana e leve economia para a mesa da família.",
    },
    {
      step: "06",
      title: "Comparador Premium",
      description:
        "Compare cestas e substituições nos planos Pro e Família — sem alterar preços.",
    },
  ] as const,

  offers: {
    title: "Ofertas que acompanham sua rotina",
    description: OFFERS_MARKETING.shortDescription,
    integrationPoints: OFFERS_INTEGRATION_POINTS,
    compareNote: OFFERS_MARKETING.compareNote,
  },

  finalCta: {
    title: "Sua casa mais organizada. Seu bolso mais inteligente.",
    description:
      "Junte receitas com IA, despensa, listas de compras e Central de Ofertas em uma única conta — gratuita para começar.",
    primaryLabel: "Criar conta grátis",
    secondaryLabel: "Comparar planos",
    trustPoints: [
      "Plano Gratuito com ofertas de supermercado",
      "Sem cartão para experimentar",
      "Cancele a assinatura quando quiser",
    ] as const,
  },
} as const;

export type MarketingLandingConfig = typeof MARKETING_LANDING;
