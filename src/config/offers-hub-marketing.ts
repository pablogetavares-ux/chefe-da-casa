import { OFFER_HUB_VERTICAL_SLUGS } from "@/modules/offers/services/catalog";

/**
 * Verticais da Central de Ofertas para marketing público.
 * Espelha `offer_verticals` (Supabase) — atualizar após migrations via MCP.
 */
export type OffersHubMarketingVertical = {
  slug: (typeof OFFER_HUB_VERTICAL_SLUGS)[number] | string;
  name: string;
  description: string;
  iconKey: string;
  sortOrder: number;
  isActive: boolean;
  /** Gancho comercial — economia no dia a dia doméstico */
  savingsLine: string;
};

export const OFFERS_HUB_MARKETING_VERTICALS = [
  {
    slug: "supermarket",
    name: "Supermercados",
    description:
      "Promoções de alimentos, bebidas e itens do dia a dia nos mercados da sua região.",
    iconKey: "shopping-cart",
    sortOrder: 1,
    isActive: true,
    savingsLine: "Feira, despensa e lista de compras conectadas.",
  },
  {
    slug: "pharmacy",
    name: "Farmácias",
    description:
      "Descontos em medicamentos, vitaminas e produtos de saúde e bem-estar.",
    iconKey: "pill",
    sortOrder: 2,
    isActive: true,
    savingsLine: "Cuidados da família sem estourar o orçamento.",
  },
  {
    slug: "pet_shop",
    name: "Pet Shop",
    description:
      "Ofertas em ração, acessórios e cuidados para cães, gatos e outros pets.",
    iconKey: "paw-print",
    sortOrder: 3,
    isActive: true,
    savingsLine: "Seu pet no radar de promoções da cidade.",
  },
  {
    slug: "clothing",
    name: "Roupas",
    description:
      "Moda feminina, masculina e infantil com preços especiais perto de você.",
    iconKey: "shirt",
    sortOrder: 4,
    isActive: true,
    savingsLine: "Uniformes, básicos e moda com desconto local.",
  },
  {
    slug: "footwear",
    name: "Calçados",
    description:
      "Tênis, sandálias e calçados para todas as ocasiões em promoção.",
    iconKey: "footprints",
    sortOrder: 5,
    isActive: true,
    savingsLine: "Volta às aulas e dia a dia com preço melhor.",
  },
  {
    slug: "construction",
    name: "Materiais de Construção",
    description:
      "Tintas, ferragens e materiais para reforma e obra com os melhores preços.",
    iconKey: "hammer",
    sortOrder: 6,
    isActive: true,
    savingsLine: "Reforma, manutenção e pequenos reparos em casa.",
  },
  {
    slug: "electronics",
    name: "Eletrônicos",
    description:
      "Celulares, informática e eletrodomésticos em oferta na sua cidade.",
    iconKey: "smartphone",
    sortOrder: 7,
    isActive: true,
    savingsLine: "Eletrodomésticos e tech quando precisar trocar.",
  },
] as const satisfies readonly OffersHubMarketingVertical[];

/** Slug reservado no banco para expansão futura (não exibido na landing v1). */
export const OFFERS_HUB_FUTURE_VERTICAL_SLUGS = ["services"] as const;

export const OFFERS_HUB_MARKETING = {
  eyebrow: "Central de Ofertas",
  title: "Economize em toda a rotina da sua casa — não só no mercado",
  description:
    "Um hub com categorias de consumo doméstico: da feira à farmácia, do pet shop à reforma. Promoções regionais gratuitas no plano Free, integradas ao que você já usa no app.",
  stats: [
    {
      value: String(OFFERS_HUB_MARKETING_VERTICALS.length),
      label: "categorias no hub",
    },
    { value: "Grátis", label: "no plano Free" },
    { value: "1", label: "conta para a família" },
  ] as const,
  domesticSavings: [
    "Mercado e despensa alinhados às promoções da sua cidade.",
    "Lista de compras com itens em oferta antes de sair de casa.",
    "Novas categorias entram no mesmo hub — sem app separado.",
  ] as const,
  ctaPrimary: "Criar conta e ver ofertas",
  ctaSecondary: "Já tenho conta",
} as const;

export function listOffersHubMarketingVerticals(): OffersHubMarketingVertical[] {
  return [...OFFERS_HUB_MARKETING_VERTICALS].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}
