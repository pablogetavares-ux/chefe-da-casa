import type { Metadata } from "next";

import { MarketingFooter, MarketingHeader } from "@/components/layout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Pular para o conteúdo
      </a>
      <MarketingHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
