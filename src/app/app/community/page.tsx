import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Comunidade",
  robots: { index: false },
};

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <PageHeader
        title="Comunidade"
        description="Compartilhe receitas e inspire outros chefs da casa."
      />
      <Card className="surface-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-7" />
          </div>
          <CardTitle className="font-heading text-2xl">Em breve</CardTitle>
          <CardDescription>
            Estamos construindo um espaço para trocar receitas, dicas e
            experiências. Enquanto isso, use favoritas e gere receitas com a IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            Lançamento previsto em uma próxima versão
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/app/generate"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Gerar receita
            </Link>
            <Link
              href="/app/favorites"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Ver favoritas
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
