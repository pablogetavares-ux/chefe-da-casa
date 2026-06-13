import { MARKETING_FAQ } from "@/config/marketing-faq";
import { MARKETING_LANDING } from "@/config/marketing-landing";
import { PLANS } from "@/config/plans";
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
    applicationSubCategory: "Economia doméstica",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      description:
        "Plano Gratuito com receitas IA, despensa e ofertas regionais",
    },
    featureList: [
      "Receitas com inteligência artificial",
      "Despensa inteligente",
      "Lista de compras com promoções",
      "Central de Ofertas multi-categoria",
      "Plano semanal de refeições",
      "Comparador de preços (planos pagos)",
    ],
    inLanguage: "pt-BR",
    url: siteConfig.url,
  };

  return <JsonLd data={data} />;
}

export function FaqPageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MARKETING_FAQ.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

export function PricingPageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${siteConfig.name} — Planos`,
    description: MARKETING_LANDING.subheadline,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: (Object.keys(PLANS) as (keyof typeof PLANS)[]).map((planId) => {
      const plan = PLANS[planId];
      return {
        "@type": "Offer",
        name: plan.name,
        price: plan.priceMonthly,
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      };
    }),
    url: `${siteConfig.url}/pricing`,
  };

  return <JsonLd data={data} />;
}
