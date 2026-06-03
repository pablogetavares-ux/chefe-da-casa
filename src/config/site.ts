export const siteConfig = {
  name: "Chef da Casa AI",
  description:
    "Crie receitas saudáveis e saborosas com os ingredientes que você já tem em casa.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/opengraph-image",
  links: {
    github: "https://github.com/chef-da-casa-ai",
    twitter: "https://twitter.com/chefdacasaai",
  },
  locale: "pt-BR",
} as const;

export type SiteConfig = typeof siteConfig;
