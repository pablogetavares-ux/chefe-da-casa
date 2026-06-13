import { MARKETING_LANDING } from "@/config/marketing-landing";
import { siteConfig } from "@/config/site";

export const LANDING_SEO = {
  title: `${siteConfig.name} — Receitas, Compras e Economia Doméstica com IA`,
  description: MARKETING_LANDING.subheadline,
  keywords: [
    "economia doméstica",
    "receitas com IA",
    "lista de compras inteligente",
    "ofertas supermercado",
    "despensa inteligente",
    "app cozinha família",
    "Chefe da Casa",
    "central de ofertas",
    "comparador de preços mercado",
  ],
  ogTitle: MARKETING_LANDING.tagline,
  ogDescription: siteConfig.description,
} as const;

export const PRICING_SEO = {
  title: "Planos e Preços",
  description:
    "Planos Gratuito, Pro e Família para receitas com IA, despensa, listas de compras e Central de Ofertas. Comece grátis.",
} as const;
