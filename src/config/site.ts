export const siteConfig = {
  name: "Chefe da Casa",
  description:
    "Receitas, Compras e Economia Inteligente para sua Família — despensa, listas e ofertas regionais conectadas.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/opengraph-image",
  links: {
    github: "https://github.com/chefe-da-casa",
    twitter: "https://twitter.com/chefdacasaai",
  },
  locale: "pt-BR",
} as const;

export type SiteConfig = typeof siteConfig;
