import { siteConfig } from "@/config/site";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function HomePageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    inLanguage: "pt-BR",
    url: siteConfig.url,
  };

  return <JsonLd data={data} />;
}

export function PricingPageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${siteConfig.name} — Planos`,
    description: "Planos Free, Pro e Família para receitas com IA.",
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Pro",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Família",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    ],
    url: `${siteConfig.url}/pricing`,
  };

  return <JsonLd data={data} />;
}
