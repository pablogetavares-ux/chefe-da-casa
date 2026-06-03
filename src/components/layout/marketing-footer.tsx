import Link from "next/link";
import { ChefHat } from "lucide-react";

import { siteConfig } from "@/config/site";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2 font-heading text-lg font-semibold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ChefHat className="size-4" />
              </span>
              {siteConfig.name}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4">
            <div className="space-y-3">
              <p className="font-medium text-foreground">Produto</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/pricing" className="hover:text-foreground">
                  Planos
                </Link>
                <Link href="/#como-funciona" className="hover:text-foreground">
                  Como funciona
                </Link>
                <Link href="/#faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-foreground">Conta</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/login" className="hover:text-foreground">
                  Entrar
                </Link>
                <Link href="/signup" className="hover:text-foreground">
                  Criar conta
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-foreground">App</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/app" className="hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/app/generate" className="hover:text-foreground">
                  Gerar receita
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-foreground">Legal</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/privacidade" className="hover:text-foreground">
                  Privacidade
                </Link>
                <Link href="/termos" className="hover:text-foreground">
                  Termos de uso
                </Link>
                <Link href="/cookies" className="hover:text-foreground">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
