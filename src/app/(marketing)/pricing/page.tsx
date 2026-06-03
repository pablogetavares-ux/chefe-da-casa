import type { Metadata } from "next";

import { PricingPlans } from "@/components/features/marketing/pricing-plans";
import { PricingPageJsonLd } from "@/components/shared/json-ld";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Planos e Preços",
  description: "Escolha o plano ideal para suas receitas com IA.",
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
          Planos flexíveis
        </Badge>
        <h1 className="font-heading text-3xl font-semibold md:text-5xl">
          Escolha seu plano
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Comece grátis e evolua quando quiser. Sem compromisso.
        </p>
      </div>

      <PricingPlans isAuthenticated={Boolean(user)} />
    </section>
  );
}
