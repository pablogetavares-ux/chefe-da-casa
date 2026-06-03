import type { Metadata } from "next";
import Link from "next/link";

import { GeneratePageContent } from "@/components/features/recipes/generate-page-content";
import { AnimatedPage } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Gerar receita",
  description:
    "Gere receitas personalizadas com IA a partir da sua despensa ou fotos de ingredientes.",
};

export default function GenerateRecipePage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Gerar receita com IA"
        description="Selecione ingredientes, escaneie uma foto ou deixe o Chef criar uma receita saudável para você."
      >
        <Link href="/app/pantry">
          <Button variant="outline" size="sm">
            Gerenciar despensa
          </Button>
        </Link>
      </PageHeader>

      <GeneratePageContent />
    </AnimatedPage>
  );
}
