/**
 * Tokens de design do Chef da Casa AI.
 * Cores em OKLCH — aplicadas em globals.css via CSS variables.
 */
export const themeConfig = {
  /** Identidade visual */
  brand: {
    name: "Chef da Casa",
    tagline: "Receitas saudáveis com o que você tem em casa",
  },

  /** Modos de cor */
  defaultTheme: "system" as const,
  themes: ["light", "dark", "system"] as const,

  /** Raio padrão (shadcn) */
  radius: "0.625rem",

  /** Breakpoints Tailwind (referência) */
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
} as const;

export type ThemeMode = (typeof themeConfig.themes)[number];
