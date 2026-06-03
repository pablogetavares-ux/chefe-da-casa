"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChefHat, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { AnimatedPage, FadeIn } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiChat, useAiStatus } from "@/hooks/use-api";
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

export function AiChatPanel() {
  const { data: aiStatus } = useAiStatus();
  const chat = useAiChat();
  const [input, setInput] = useState("");
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

    const userMsg = createMessage("user", trimmed);
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");

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
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(trimmed);
      toast.error(
        err instanceof Error ? err.message : "Falha ao enviar mensagem.",
      );
    }
  }

  return (
    <AnimatedPage className="flex min-h-[calc(100dvh-12rem)] flex-col md:min-h-[calc(100dvh-8rem)]">
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
            disabled={!input.trim() || chat.isPending}
            aria-label="Enviar mensagem"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </AnimatedPage>
  );
}
