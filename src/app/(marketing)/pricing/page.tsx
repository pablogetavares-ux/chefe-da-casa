import type { Metadata } from "next";

import { PricingPlans } from "@/components/features/marketing/pricing-plans";
import { PricingPageJsonLd } from "@/components/shared/json-ld";
import { Badge } from "@/components/ui/badge";
import { MARKETING_PLANS_SECTION } from "@/config/marketing-plans";
import { PRICING_SEO } from "@/config/marketing-seo";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: PRICING_SEO.title,
  description: PRICING_SEO.description,
  alternates: { canonical: `${siteConfig.url}/pricing` },
  openGraph: {
    title: `${PRICING_SEO.title} | ${siteConfig.name}`,
    description: PRICING_SEO.description,
    url: `${siteConfig.url}/pricing`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <PricingPageJsonLd />
      <div className="mb-14 text-center">
        <Badge variant="secondary" className="mb-4">
          {MARKETING_PLANS_SECTION.eyebrow}
        </Badge>
        <h1 className="font-heading text-3xl font-semibold text-balance md:text-5xl">
          {MARKETING_PLANS_SECTION.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {MARKETING_PLANS_SECTION.description}
        </p>
      </div>

      <PricingPlans isAuthenticated={Boolean(user)} />

      <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
        {MARKETING_PLANS_SECTION.footnote}
      </p>
    </section>
  );
}
