import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const AiChatPanel = dynamic(
  () =>
    import("@/components/features/chat/ai-chat-panel").then(
      (mod) => mod.AiChatPanel,
    ),
  { loading: () => <PanelSkeleton rows={6} label="Carregando chat..." /> },
);

export const metadata: Metadata = {
  title: "Chat IA",
  description:
    "Converse com o Chef — dúvidas culinárias, substituições e ideias rápidas.",
};

export default function ChatPage() {
  return <AiChatPanel />;
}
