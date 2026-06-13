"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChefHat, Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedPage, FadeIn } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiChat, useAiStatus } from "@/hooks/use-api";
import { classifyClientError } from "@/lib/api/client-errors";
import {
  notifyChatUpdated,
  saveChatSnapshot,
} from "@/modules/home/hooks/use-chat-continuation";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const STARTER_PROMPTS = [
  "O que fazer com ovos e tomate?",
  "Substituto para creme de leite?",
  "Ideia de jantar vegano rápido",
  "Como usar sobras de arroz?",
];

function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function ChatErrorBanner({
  title,
  message,
  onRetry,
  onDismiss,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="surface-card flex items-start gap-3 border-destructive/30 bg-destructive/5 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            Tentar novamente
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar aviso"
          onClick={onDismiss}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

export function AiChatPanel() {
  const {
    data: aiStatus,
    isError: statusQueryError,
    error: statusQueryErr,
    refetch: refetchStatus,
    isLoading: statusLoading,
  } = useAiStatus();
  const chat = useAiChat();
  const [input, setInput] = useState("");
  const [chatErrorDismissed, setChatErrorDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "assistant",
      "Olá, Chef! Sou seu assistente culinário. Pergunte sobre receitas, substituições, técnicas ou o que cozinhar com sua despensa.",
    ),
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, chat.isPending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;

    if (aiStatus?.configured === false) {
      toast.error(
        "Chat indisponível — configure a IA ou use o modo demonstração.",
      );
      return;
    }

    const userMsg = createMessage("user", trimmed);
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setChatErrorDismissed(false);

    const payload = nextMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map(({ role, content }) => ({ role, content }));

    try {
      const result = await chat.mutateAsync(payload);
      const assistantContent = result.message.content;
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", assistantContent),
      ]);
      saveChatSnapshot({
        lastUserMessage: trimmed,
        lastAssistantPreview: assistantContent.slice(0, 120),
        updatedAt: new Date().toISOString(),
      });
      notifyChatUpdated();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(trimmed);
    }
  }

  const statusErrorMessage = statusQueryError
    ? classifyClientError(statusQueryErr).message
    : null;

  const chatErrorMessage = chat.isError
    ? classifyClientError(chat.error).message
    : null;

  const aiUnavailable =
    !statusLoading && aiStatus && aiStatus.configured === false;

  if (statusQueryError && !aiStatus) {
    return (
      <AnimatedPage>
        <PageHeader
          title="Chat IA"
          description="Converse com o Chef — dúvidas culinárias, substituições e ideias rápidas."
        />
        <ErrorFallback
          title="Chat indisponível"
          message={
            statusErrorMessage ?? "Não foi possível verificar o serviço de IA."
          }
          reset={() => void refetchStatus()}
        />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex min-h-[calc(100dvh-12rem-env(safe-area-inset-bottom))] flex-col gap-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:min-h-[calc(100dvh-8rem)] md:pb-0">
      <PageHeader
        title="Chat IA"
        description="Converse com o Chef — dúvidas culinárias, substituições e ideias rápidas."
      />

      {aiStatus?.mock && (
        <FadeIn>
          <div className="surface-card flex items-center gap-2 border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-blue-500" />
            Modo demonstração — respostas simuladas. Configure OPENAI_API_KEY
            para chat real.
          </div>
        </FadeIn>
      )}

      {aiUnavailable && (
        <ChatErrorBanner
          title="IA não configurada"
          message="O chat está desativado neste ambiente. Ative OPENAI_API_KEY ou AI_DEV_MOCK para usar o assistente."
          onRetry={() => void refetchStatus()}
        />
      )}

      {chat.isError && !chatErrorDismissed && chatErrorMessage && (
        <ChatErrorBanner
          title="Falha ao enviar mensagem"
          message={chatErrorMessage}
          onRetry={() => {
            chat.reset();
            setChatErrorDismissed(false);
          }}
          onDismiss={() => setChatErrorDismissed(true)}
        />
      )}

      <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6"
          role="log"
          aria-live="polite"
          aria-label="Histórico do chat"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {msg.role === "user" ? (
                  <ChefHat className="size-4" />
                ) : (
                  <Bot className="size-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/80 text-foreground",
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chat.isPending && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-4 animate-spin" />
              Chef está pensando...
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t px-4 py-3">
            {STARTER_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={aiUnavailable || chat.isPending}
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}

        <form
          className="flex gap-2 border-t p-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <Textarea
            id="chat-input"
            aria-label="Mensagem para o Chef"
            placeholder="Pergunte ao Chef..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            className="min-h-10 resize-none"
            disabled={aiUnavailable}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 self-end"
            disabled={!input.trim() || chat.isPending || aiUnavailable}
            aria-label="Enviar mensagem"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </AnimatedPage>
  );
}
