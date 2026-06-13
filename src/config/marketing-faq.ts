/** FAQ da landing — alinhado ao produto real (receitas, IA, despensa, ofertas, billing). */
export type MarketingFaqItem = {
  id: string;
  category:
    | "produto"
    | "ia"
    | "despensa"
    | "compras"
    | "ofertas"
    | "planos"
    | "economia";
  question: string;
  answer: string;
};

export const MARKETING_FAQ = {
  eyebrow: "FAQ",
  title: "Dúvidas sobre receitas, compras e economia doméstica",
  description:
    "Respostas claras sobre IA, despensa, listas, Central de Ofertas e assinaturas — antes de criar sua conta.",
  items: [
    {
      id: "what-is",
      category: "produto",
      question: "O Chefe da Casa é só um app de receitas?",
      answer:
        "Não. É um SaaS de economia doméstica inteligente: receitas com IA, despensa, listas de compras, plano semanal e Central de Ofertas multi-categoria — tudo conectado para reduzir desperdício e gastos da família.",
    },
    {
      id: "ai-recipes",
      category: "ia",
      question: "Como a IA gera receitas personalizadas?",
      answer:
        "A IA lê sua despensa (itens cadastrados ou escaneados por foto) e sugere receitas saudáveis em segundos. Você pode usar modos fitness, vegano, anti-desperdício e preferências do perfil familiar.",
    },
    {
      id: "pantry",
      category: "despensa",
      question: "Para que serve a despensa inteligente?",
      answer:
        "Ela registra o que você tem em casa e alimenta receitas, listas de compras e sugestões de ofertas. Assim você cozinha com o que já comprou e evita comprar em duplicidade.",
    },
    {
      id: "shopping-list",
      category: "compras",
      question: "Como a lista de compras ajuda a economizar?",
      answer:
        "Itens faltantes são organizados por categoria e cruzados com promoções da sua região. Você sai de casa sabendo o que falta e onde há desconto — menos improviso, mais controle do orçamento.",
    },
    {
      id: "offers-hub",
      category: "ofertas",
      question: "O que é a Central de Ofertas?",
      answer:
        "Um hub com categorias além do supermercado: farmácias, pet shop, roupas, calçados, construção e eletrônicos. Supermercados já estão disponíveis; novas categorias entram no mesmo lugar, sem outro app.",
    },
    {
      id: "offers-city",
      category: "ofertas",
      question: "As ofertas funcionam na minha cidade?",
      answer:
        "Sim, quando há mercados cadastrados na região. Defina sua cidade no perfil ou na Central de Ofertas. Promoções aparecem na despensa, nas receitas e na lista de compras.",
    },
    {
      id: "offers-vs-compare",
      category: "economia",
      question: "Qual a diferença entre ofertas e comparador de preços?",
      answer:
        "Ofertas regionais são gratuitas no plano Free para usuários logados. O comparador avançado de cestas e substituições é recurso dos planos Pro e Família.",
    },
    {
      id: "free-plan",
      category: "planos",
      question: "Preciso pagar para começar?",
      answer:
        "Não. O plano Gratuito inclui gerações de receita com IA, despensa básica, favoritos, lista de compras com promoções e ofertas de supermercados. Upgrade só quando fizer sentido.",
    },
    {
      id: "plans-diff",
      category: "planos",
      question: "Qual a diferença entre Gratuito, Pro e Família?",
      answer:
        "Gratuito cobre o essencial com limites mensais. Pro amplia IA, despensa e comparador de preços. Família traz limites maiores e prioridade para rotina de casa inteira — ideal para quem planeja compras e refeições em escala.",
    },
    {
      id: "cancel",
      category: "planos",
      question: "Posso cancelar a assinatura a qualquer momento?",
      answer:
        "Sim. Pelo portal de billing no seu perfil, sem multa. Você volta ao plano Gratuito e mantém acesso aos recursos incluídos nele.",
    },
    {
      id: "mobile",
      category: "produto",
      question: "Funciona bem no celular?",
      answer:
        "Sim. O produto é mobile first: navegação inferior, gestos e layout responsivo em todas as telas — ideal para usar no mercado e na cozinha.",
    },
    {
      id: "domestic-economy",
      category: "economia",
      question: "Como o app ajuda na economia doméstica no dia a dia?",
      answer:
        "Conectando cozinha e compras: menos desperdício com anti-desperdício e despensa, listas objetivas, ofertas locais e plano semanal. O objetivo é gastar menos tempo decidindo e menos dinheiro repetindo compras.",
    },
  ] satisfies MarketingFaqItem[],
} as const;

export type MarketingFaqConfig = typeof MARKETING_FAQ;
