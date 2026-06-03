import Link from "next/link";
import { ChefHat, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-5 text-primary">
        <ChefHat className="size-10" aria-hidden />
      </div>
      <h1 className="font-heading text-3xl font-semibold">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button variant="outline" className="gap-2 min-w-36">
            <Home className="size-4" />
            Início
          </Button>
        </Link>
        <Link href="/app">
          <Button className="min-w-36">Ir para o app</Button>
        </Link>
      </div>
    </div>
  );
}
