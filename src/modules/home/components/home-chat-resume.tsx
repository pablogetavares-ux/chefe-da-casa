"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { useChatContinuation } from "@/modules/home/hooks/use-chat-continuation";

export function HomeChatResume() {
  const { snapshot } = useChatContinuation();

  if (!snapshot?.lastUserMessage) return null;

  return (
    <Link
      href="/app/chat"
      className="surface-card flex items-start gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-shadow hover:shadow-md"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <MessageCircle className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Continuar conversa IA</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          Você: {snapshot.lastUserMessage}
        </p>
        {snapshot.lastAssistantPreview ? (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            Chef: {snapshot.lastAssistantPreview}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
