import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Chefe da Casa",
    description: siteConfig.description,
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#2d5016",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
