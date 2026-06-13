/**
 * Mensagens e pontos de integração do módulo de ofertas —
 * fonte única para marketing, home, hub e perfil.
 */
export const OFFERS_INTEGRATION_POINTS = [
  {
    id: "recipes",
    label: "Receitas",
    description:
      "Ingredientes em promoção na receita aberta e após gerar com IA",
  },
  {
    id: "shopping",
    label: "Lista de compras",
    description: "Itens da lista com ofertas na sua região",
  },
  {
    id: "pantry",
    label: "Despensa",
    description: "Sugestões para o que falta em casa",
  },
  {
    id: "profile",
    label: "Perfil familiar",
    description: "Categorias priorizadas pelo plano, fitness e modo sênior",
  },
] as const;

/** Recursos planejados — espelham offer_extension_registry (sem UI ativa). */
export const OFFERS_ROADMAP_ITEMS = [
  "Favoritos de produto",
  "Alertas de preço",
  "Notificações push",
  "Cashback",
  "Cupons",
] as const;

export const OFFERS_MARKETING = {
  tagline: "Economize em toda a rotina doméstica",
  shortDescription:
    "Central de Ofertas com supermercados, farmácias, pet shop e mais — conectada à despensa, receitas e lista de compras.",
  heroStat: { value: "Grátis", label: "ofertas na sua região" },
  compareNote:
    "Navegue ofertas no plano gratuito. O comparador de preços avançado é recurso Premium.",
} as const;
