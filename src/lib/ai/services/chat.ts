import type { ChatMessageInput } from "@/types";

const CULINARY_SYSTEM = `Você é o Chef da Casa, assistente culinário brasileiro amigável e prático.
Responda em português do Brasil, com tom acolhedor e objetivo.
Ajude com receitas, substituições, técnicas, meal prep, nutrição básica e uso da despensa.
Respostas concisas (máximo 3 parágrafos curtos) salvo se o usuário pedir detalhes.`;

const MOCK_REPLIES: Record<string, string> = {
  default:
    "Ótima pergunta! Com os ingredientes que você tem, sugiro um refogado rápido: aqueça azeite, refogue alho e cebola, adicione os legumes mais firmes primeiro e tempere com sal, pimenta e ervas. Se quiser, posso montar uma receita completa — acesse Gerar receita no app.",
  ovo: "Ovos são versáteis! Omelete de legumes, shakshuka simples ou arroz com ovo e cebolinha. Para omelete: 2 ovos batidos, sal, legumes picados na frigideira antiaderente. 5 minutos e pronto.",
  vegano:
    "Para um prato vegano rápido: grão-de-bico refogado com tomate, pimentão e cominho; ou bowl com quinoa, abóbora assada e tahine. Quer substituir algum ingrediente específico?",
  substitu:
    "Substituições comuns: creme de leite → leite de coco ou iogurte; manteiga → azeite; farinha de trigo → farinha de arroz (1:1 em bolos simples). Me diga o ingrediente e eu indico a melhor troca.",
};

function pickMockReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("ovo")) return MOCK_REPLIES.ovo;
  if (lower.includes("vegan")) return MOCK_REPLIES.vegano;
  if (lower.includes("substitu")) return MOCK_REPLIES.substitu;
  return MOCK_REPLIES.default;
}

export async function chatWithChef(
  messages: ChatMessageInput[],
): Promise<{ reply: string; mock: boolean }> {
  const { isAiMockEnabled, isOpenAiConfigured, delay } =
    await import("@/lib/ai/mock");

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content.trim()) {
    throw new Error("Mensagem vazia");
  }

  if (isAiMockEnabled() || !isOpenAiConfigured()) {
    await delay(600 + Math.random() * 400);
    return { reply: pickMockReply(lastUser.content), mock: true };
  }

  const { getOpenAIClient } = await import("@/lib/ai/client");
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 600,
    messages: [
      { role: "system", content: CULINARY_SYSTEM },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const reply =
    completion.choices[0]?.message?.content?.trim() ??
    "Desculpe, não consegui responder agora. Tente novamente.";

  return { reply, mock: false };
}
