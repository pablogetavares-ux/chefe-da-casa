import Link from "next/link";
import { AlertTriangle, ExternalLink, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAiStatus } from "@/hooks/use-api";

export function AiConfigBanner() {
  const { data: status, isLoading } = useAiStatus();

  if (isLoading || !status) {
    return null;
  }

  if (status.mock) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4"
      >
        <div className="flex gap-3">
          <FlaskConical className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-400" />
          <div className="space-y-1">
            <p className="font-medium text-blue-900 dark:text-blue-200">
              Modo demonstração ativo
            </p>
            <p className="text-sm text-blue-800/90 dark:text-blue-300/90">
              A IA funciona localmente com receitas de exemplo. Para receitas
              reais geradas pela OpenAI, adicione{" "}
              <code className="rounded bg-blue-500/15 px-1.5 py-0.5 text-xs">
                OPENAI_API_KEY
              </code>{" "}
              no{" "}
              <code className="rounded bg-blue-500/15 px-1.5 py-0.5 text-xs">
                .env
              </code>{" "}
              e reinicie o servidor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status.configured) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              IA não configurada neste ambiente
            </p>
            <p className="text-sm text-amber-800/90 dark:text-amber-300/90">
              Adicione{" "}
              <code className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs">
                OPENAI_API_KEY
              </code>{" "}
              no arquivo{" "}
              <code className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs">
                .env
              </code>{" "}
              na raiz do projeto e reinicie o servidor (
              <code className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs">
                yarn dev
              </code>
              ).
            </p>
          </div>
        </div>
        <Link
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-amber-500/40 bg-background/80"
          >
            Obter chave OpenAI
            <ExternalLink className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
