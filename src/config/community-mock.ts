export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  title: string;
  excerpt: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
};

export const communityPosts: CommunityPost[] = [
  {
    id: "1",
    author: "Ana Costa",
    avatar: "AC",
    title: "Bowl de quinoa com legumes assados",
    excerpt:
      "Usei sobras da despensa e ficou incrível! Modo fitness, 25 minutos.",
    tags: ["fitness", "vegano"],
    likes: 42,
    comments: 8,
    createdAt: "2026-05-20",
  },
  {
    id: "2",
    author: "Bruno M.",
    avatar: "BM",
    title: "Frango grelhado com ervas — low carb",
    excerpt:
      "Receita gerada pela IA com o que tinha na geladeira. Família aprovou!",
    tags: ["low-carb", "família"],
    likes: 31,
    comments: 5,
    createdAt: "2026-05-19",
  },
  {
    id: "3",
    author: "Julia R.",
    avatar: "JR",
    title: "Sopa cremosa de abóbora econômica",
    excerpt:
      "Gastei menos de R$15 para 6 porções. Modo econômico é sensacional.",
    tags: ["econômico", "sopa"],
    likes: 56,
    comments: 12,
    createdAt: "2026-05-18",
  },
  {
    id: "4",
    author: "Pedro L.",
    avatar: "PL",
    title: "Salada mediterrânea com grão-de-bico",
    excerpt:
      "Perfeita para meal prep da semana. Exportei a lista de compras direto.",
    tags: ["meal-prep", "saudável"],
    likes: 28,
    comments: 3,
    createdAt: "2026-05-17",
  },
];

export const communityTags = [
  "Todos",
  "fitness",
  "vegano",
  "low-carb",
  "econômico",
  "família",
];
