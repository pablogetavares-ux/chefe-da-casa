import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { BenefitsSection } from "@/components/features/marketing/benefits-section";
import { FinalCtaSection } from "@/components/features/marketing/final-cta-section";
import { HeroSection } from "@/components/features/marketing/hero-section";
import { LandingPlansSection } from "@/components/features/marketing/landing-plans-section";
import { OffersHubSection } from "@/components/features/marketing/offers-hub-section";
import { ResourcesSection } from "@/components/features/marketing/resources-section";
import { FaqPageJsonLd, HomePageJsonLd } from "@/components/shared/json-ld";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";
import { LANDING_SEO } from "@/config/marketing-seo";
import { planTierToPlanId } from "@/config/plans";
import { siteConfig } from "@/config/site";
import { isBillingAvailable } from "@/lib/billing/mock";
import { createClient } from "@/lib/supabase/server";

const FaqSection = dynamic(
  () =>
    import("@/components/features/marketing/faq-section").then(
      (mod) => mod.FaqSection,
    ),
  { loading: () => <PanelSkeleton rows={3} label="Carregando FAQ..." /> },
);

export const metadata: Metadata = {
  title: LANDING_SEO.title,
  description: LANDING_SEO.description,
  keywords: [...LANDING_SEO.keywords],
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: LANDING_SEO.ogTitle,
    description: LANDING_SEO.ogDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: LANDING_SEO.ogTitle,
    description: LANDING_SEO.ogDescription,
    images: [siteConfig.ogImage],
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlanId = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    currentPlanId = planTierToPlanId(profile?.plan ?? "FREE");
  }

  return (
    <>
      <HomePageJsonLd />
      <FaqPageJsonLd />
      <HeroSection />
      <BenefitsSection />
      <ResourcesSection />
      <OffersHubSection />
      <LandingPlansSection
        currentPlanId={currentPlanId}
        isAuthenticated={Boolean(user)}
        billingAvailable={isBillingAvailable()}
      />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
