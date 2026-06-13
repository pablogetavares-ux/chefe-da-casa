import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";
import {
  isOfferHubVerticalSlug,
  OFFER_HUB_VERTICAL_SLUGS,
} from "@/modules/offers/services/catalog";

const OffersPanel = dynamic(
  () =>
    import("@/modules/offers/components/offers-panel").then(
      (mod) => mod.OffersPanel,
    ),
  { loading: () => <PanelSkeleton rows={4} label="Carregando ofertas..." /> },
);

const VERTICAL_PAGE_COPY: Record<
  (typeof OFFER_HUB_VERTICAL_SLUGS)[number],
  { title: string; description: string }
> = {
  supermarket: {
    title: "Supermercados",
    description:
      "Promoções de mercados perto de você — adicione direto à lista de compras.",
  },
  pharmacy: {
    title: "Farmácias",
    description: "Medicamentos e produtos de saúde em promoção na sua região.",
  },
  pet_shop: {
    title: "Pet Shop",
    description: "Ofertas para o seu pet nos parceiros da região.",
  },
  clothing: {
    title: "Roupas",
    description: "Moda e vestuário com preços especiais perto de você.",
  },
  footwear: {
    title: "Calçados",
    description: "Calçados em promoção nas lojas da sua cidade.",
  },
  construction: {
    title: "Materiais de Construção",
    description: "Materiais e ferragens com os melhores preços locais.",
  },
  electronics: {
    title: "Eletrônicos",
    description: "Tecnologia e eletro em oferta na sua região.",
  },
};

type PageProps = {
  params: Promise<{ verticalSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { verticalSlug } = await params;
  if (!isOfferHubVerticalSlug(verticalSlug)) {
    return { title: "Ofertas" };
  }
  const copy = VERTICAL_PAGE_COPY[verticalSlug];
  return {
    title: copy.title,
    description: copy.description,
  };
}

export default async function OffersVerticalPage({ params }: PageProps) {
  const { verticalSlug } = await params;

  if (!isOfferHubVerticalSlug(verticalSlug)) {
    notFound();
  }

  const copy = VERTICAL_PAGE_COPY[verticalSlug];

  return (
    <AnimatedPage>
      <div className="mb-4">
        <Link
          href="/app/offers"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Central de Ofertas
        </Link>
      </div>
      <PageHeader title={copy.title} description={copy.description} />
      <OffersPanel verticalSlug={verticalSlug} verticalName={copy.title} />
    </AnimatedPage>
  );
}
