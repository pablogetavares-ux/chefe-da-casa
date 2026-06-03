import { siteConfig } from "@/config/site";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export const legalMeta = {
  companyName: siteConfig.name,
  contactEmail: "privacidade@chefdacasa.ai",
  lastUpdated: "23 de maio de 2026",
  dpoLabel: "Encarregado de dados (DPO)",
} as const;

export const privacySections: LegalSection[] = [
  {
    title: "1. Quem somos",
    paragraphs: [
      `${legalMeta.companyName} é uma plataforma digital que ajuda você a criar receitas com inteligência artificial a partir dos ingredientes da sua despensa.`,
      `Para dúvidas sobre privacidade, entre em contato: ${legalMeta.contactEmail}.`,
    ],
  },
  {
    title: "2. Dados que coletamos",
    paragraphs: [
      "Dados de cadastro: nome, e-mail e senha (armazenada de forma criptografada pelo provedor de autenticação).",
      "Dados de uso: receitas, despensa, favoritos, listas de compras, histórico de gerações de IA e logs de uso.",
      "Dados opcionais: metas fitness, modo idoso, fotos enviadas para scan de ingredientes.",
      "Dados de pagamento: processados pelo Stripe; não armazenamos número completo de cartão.",
    ],
  },
  {
    title: "3. Finalidade e base legal (LGPD)",
    paragraphs: [
      "Executamos o contrato ao prestar o serviço (Art. 7º, V).",
      "Usamos consentimento para cookies não essenciais e comunicações opcionais (Art. 7º, I).",
      "Tratamos dados para segurança, prevenção a fraudes e cumprimento legal (Art. 7º, II e IX).",
    ],
  },
  {
    title: "4. Compartilhamento",
    paragraphs: [
      "Utilizamos Supabase (hospedagem e banco), OpenAI (geração de receitas), Stripe (pagamentos) e, quando configurado, Sentry (monitoramento de erros) e Upstash (rate limit).",
      "Não vendemos seus dados pessoais.",
    ],
  },
  {
    title: "5. Retenção",
    paragraphs: [
      "Mantemos os dados enquanto sua conta estiver ativa ou conforme exigido por lei.",
      "Após exclusão da conta, removemos ou anonimizamos os dados conforme descrito nos Termos.",
    ],
  },
  {
    title: "6. Seus direitos",
    paragraphs: [
      "Você pode acessar, corrigir, exportar e solicitar exclusão dos dados em Perfil → Privacidade e dados (LGPD).",
      "Também pode revogar consentimentos e apresentar reclamação à ANPD.",
    ],
  },
  {
    title: "7. Segurança",
    paragraphs: [
      "Aplicamos criptografia em trânsito (HTTPS), controle de acesso por usuário (RLS) e boas práticas de desenvolvimento seguro.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "1. Aceitação",
    paragraphs: [
      `Ao usar o ${legalMeta.companyName}, você concorda com estes Termos e com a Política de Privacidade.`,
    ],
  },
  {
    title: "2. Conta e elegibilidade",
    paragraphs: [
      "Você deve fornecer informações verdadeiras e manter sua senha em sigilo.",
      "É proibido usar a plataforma para fins ilegais ou abusivos.",
    ],
  },
  {
    title: "3. Planos e pagamentos",
    paragraphs: [
      "Planos pagos são cobrados via Stripe conforme preços exibidos na página de planos.",
      "Você pode cancelar a assinatura pelo portal de billing; o acesso Pro/Família permanece até o fim do período pago.",
    ],
  },
  {
    title: "4. Conteúdo gerado por IA",
    paragraphs: [
      "Receitas e sugestões são orientativas. Verifique alergias, validade dos alimentos e preparo seguro antes de consumir.",
      "Não substituem orientação médica ou nutricional profissional.",
    ],
  },
  {
    title: "5. Exclusão de conta",
    paragraphs: [
      "Você pode excluir sua conta a qualquer momento em Perfil. Isso remove receitas, despensa e demais dados vinculados, salvo obrigações legais de retenção.",
    ],
  },
  {
    title: "6. Limitação de responsabilidade",
    paragraphs: [
      "O serviço é fornecido “como está”, dentro dos limites permitidos pela lei aplicável.",
    ],
  },
];

export const cookiesSections: LegalSection[] = [
  {
    title: "Cookies essenciais",
    paragraphs: [
      "Necessários para login, sessão e segurança. Não podem ser desativados sem impedir o uso do app.",
    ],
  },
  {
    title: "Cookies analíticos",
    paragraphs: [
      "Quando aceitos, usamos ferramentas como Vercel Analytics para entender desempenho e uso agregado.",
    ],
  },
  {
    title: "Como gerenciar",
    paragraphs: [
      "Você pode recusar cookies não essenciais no banner ao acessar o site.",
      "Também é possível limpar cookies nas configurações do navegador.",
    ],
  },
];
