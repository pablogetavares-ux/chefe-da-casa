import type { RecipeIngredient } from "@/types";

export type WeeklyPlanGoal = "economizar" | "saude" | "proteina";

export type PlannedMealTemplate = {
  mealType: "almoco" | "jantar" | "cafe";
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
};

export type DayPlanTemplate = {
  dayIndex: number;
  dayLabel: string;
  meals: PlannedMealTemplate[];
};

export const WEEKLY_PLAN_GOAL_LABELS: Record<WeeklyPlanGoal, string> = {
  economizar: "Economizar",
  saude: "Saúde",
  proteina: "Proteína",
};

const DAY_LABELS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

const ECONOMIZAR_MEALS: PlannedMealTemplate[] = [
  {
    mealType: "almoco",
    title: "Arroz, feijão e ovo",
    description: "Clássico brasileiro, nutritivo e de baixo custo.",
    ingredients: [
      { name: "Arroz branco", quantity: 2, unit: "xícara" },
      { name: "Feijão carioca", quantity: 2, unit: "xícara" },
      { name: "Ovos", quantity: 4, unit: "un" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Alho", quantity: 2, unit: "dente" },
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 40,
  },
  {
    mealType: "almoco",
    title: "Macarrão com frango desfiado",
    description: "Rende bem e usa cortes econômicos de frango.",
    ingredients: [
      { name: "Macarrão", quantity: 400, unit: "g" },
      { name: "Frango inteiro", quantity: 1, unit: "kg" },
      { name: "Tomate", quantity: 3, unit: "un" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 2, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
  },
  {
    mealType: "almoco",
    title: "Sopa de legumes com macarrão",
    description: "Aquece bem a semana com poucos ingredientes.",
    ingredients: [
      { name: "Batata", quantity: 3, unit: "un" },
      { name: "Cenoura", quantity: 2, unit: "un" },
      { name: "Macarrão", quantity: 200, unit: "g" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
  },
  {
    mealType: "almoco",
    title: "Frango assado com batata",
    description: "Forno único: proteína e carboidrato juntos.",
    ingredients: [
      { name: "Coxa de frango", quantity: 1, unit: "kg" },
      { name: "Batata", quantity: 6, unit: "un" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Alho", quantity: 3, unit: "dente" },
      { name: "Azeite", quantity: 2, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 50,
  },
  {
    mealType: "almoco",
    title: "Omelete com legumes",
    description: "Rápido, barato e versátil para o fim da semana.",
    ingredients: [
      { name: "Ovos", quantity: 6, unit: "un" },
      { name: "Tomate", quantity: 2, unit: "un" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
  },
  {
    mealType: "almoco",
    title: "Feijão tropeiro simples",
    description: "Feijão farto com ovo e farinha — prato único.",
    ingredients: [
      { name: "Feijão carioca", quantity: 3, unit: "xícara" },
      { name: "Ovos", quantity: 4, unit: "un" },
      { name: "Farinha de mandioca", quantity: 1, unit: "xícara" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 2, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
  },
  {
    mealType: "almoco",
    title: "Galinhada econômica",
    description: "Arroz com frango e legumes em uma panela só.",
    ingredients: [
      { name: "Arroz branco", quantity: 2, unit: "xícara" },
      { name: "Frango inteiro", quantity: 800, unit: "g" },
      { name: "Cenoura", quantity: 2, unit: "un" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 2, unit: "col. sopa" },
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
  },
];

const SAUDE_MEALS: PlannedMealTemplate[] = [
  {
    mealType: "almoco",
    title: "Salada de grão-de-bico",
    description: "Fibras e proteína vegetal com vegetais crus.",
    ingredients: [
      { name: "Grão-de-bico", quantity: 2, unit: "xícara" },
      { name: "Tomate", quantity: 2, unit: "un" },
      { name: "Pepino", quantity: 1, unit: "un" },
      { name: "Azeite extra virgem", quantity: 2, unit: "col. sopa" },
      { name: "Limão", quantity: 1, unit: "un" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
  },
  {
    mealType: "almoco",
    title: "Peixe assado com legumes",
    description: "Leve, ômega-3 e forno sem excesso de gordura.",
    ingredients: [
      { name: "Filé de peixe", quantity: 600, unit: "g" },
      { name: "Abobrinha", quantity: 2, unit: "un" },
      { name: "Cenoura", quantity: 2, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
      { name: "Limão", quantity: 1, unit: "un" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
  },
  {
    mealType: "almoco",
    title: "Bowl de quinoa e vegetais",
    description: "Grão completo com legumes coloridos.",
    ingredients: [
      { name: "Quinoa", quantity: 1, unit: "xícara" },
      { name: "Brócolis", quantity: 300, unit: "g" },
      { name: "Cenoura", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
  },
  {
    mealType: "almoco",
    title: "Frango grelhado com salada",
    description: "Proteína magra e folhas frescas.",
    ingredients: [
      { name: "Peito de frango", quantity: 600, unit: "g" },
      { name: "Alface", quantity: 1, unit: "un" },
      { name: "Tomate", quantity: 2, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
  },
  {
    mealType: "almoco",
    title: "Sopa de legumes light",
    description: "Hidratante e pobre em gordura saturada.",
    ingredients: [
      { name: "Abóbora", quantity: 500, unit: "g" },
      { name: "Cenoura", quantity: 2, unit: "un" },
      { name: "Cebola", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
  },
  {
    mealType: "almoco",
    title: "Omelete de legumes",
    description: "Rápido, leve e rico em micronutrientes.",
    ingredients: [
      { name: "Ovos", quantity: 4, unit: "un" },
      { name: "Espinafre", quantity: 150, unit: "g" },
      { name: "Tomate", quantity: 1, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
  },
  {
    mealType: "almoco",
    title: "Arroz integral com legumes refogados",
    description: "Carboidrato integral e fibras para fechar a semana.",
    ingredients: [
      { name: "Arroz integral", quantity: 2, unit: "xícara" },
      { name: "Brócolis", quantity: 250, unit: "g" },
      { name: "Cenoura", quantity: 2, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
  },
];

const PROTEINA_MEALS: PlannedMealTemplate[] = [
  {
    mealType: "almoco",
    title: "Omelete proteico com aveia",
    description: "Café da manhã reforçado ou almoço rápido alto em proteína.",
    ingredients: [
      { name: "Ovos", quantity: 4, unit: "un" },
      { name: "Aveia", quantity: 0.5, unit: "xícara" },
      { name: "Queijo cottage", quantity: 100, unit: "g" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
  },
  {
    mealType: "almoco",
    title: "Frango com batata doce",
    description: "Clássico fitness: proteína magra e carboidrato de qualidade.",
    ingredients: [
      { name: "Peito de frango", quantity: 700, unit: "g" },
      { name: "Batata doce", quantity: 4, unit: "un" },
      { name: "Brócolis", quantity: 300, unit: "g" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
  },
  {
    mealType: "almoco",
    title: "Carne magra com arroz e brócolis",
    description: "Alto teor proteico para treino ou recuperação.",
    ingredients: [
      { name: "Carne magra", quantity: 600, unit: "g" },
      { name: "Arroz branco", quantity: 2, unit: "xícara" },
      { name: "Brócolis", quantity: 350, unit: "g" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
  },
  {
    mealType: "almoco",
    title: "Atum com grão-de-bico",
    description: "Proteína dupla, prática e sem fogo longo.",
    ingredients: [
      { name: "Atum em lata", quantity: 2, unit: "un" },
      { name: "Grão-de-bico", quantity: 2, unit: "xícara" },
      { name: "Tomate", quantity: 2, unit: "un" },
      { name: "Azeite", quantity: 1, unit: "col. sopa" },
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
  },
  {
    mealType: "almoco",
    title: "Iogurte proteico com frutas e aveia",
    description: "Refeição fria rica em proteína e carboidrato moderado.",
    ingredients: [
      { name: "Iogurte natural", quantity: 500, unit: "g" },
      { name: "Aveia", quantity: 1, unit: "xícara" },
      { name: "Banana", quantity: 2, unit: "un" },
      { name: "Mel", quantity: 2, unit: "col. sopa" },
    ],
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
  },
  {
    mealType: "almoco",
    title: "Frango desfiado com legumes",
    description: "Batch cooking: rende marmitas com proteína.",
    ingredients: [
      { name: "Peito de frango", quantity: 800, unit: "g" },
      { name: "Cenoura", quantity: 2, unit: "un" },
      { name: "Abobrinha", quantity: 2, unit: "un" },
      { name: "Azeite", quantity: 2, unit: "col. sopa" },
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
  },
  {
    mealType: "almoco",
    title: "Ovos cozidos com feijão e arroz",
    description: "Fechamento da semana com proteína acessível.",
    ingredients: [
      { name: "Ovos", quantity: 8, unit: "un" },
      { name: "Feijão preto", quantity: 2, unit: "xícara" },
      { name: "Arroz branco", quantity: 2, unit: "xícara" },
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 35,
  },
];

const MEALS_BY_GOAL: Record<WeeklyPlanGoal, PlannedMealTemplate[]> = {
  economizar: ECONOMIZAR_MEALS,
  saude: SAUDE_MEALS,
  proteina: PROTEINA_MEALS,
};

export function buildWeeklyDayTemplates(
  goal: WeeklyPlanGoal,
): DayPlanTemplate[] {
  const meals = MEALS_BY_GOAL[goal];
  return DAY_LABELS.map((dayLabel, index) => ({
    dayIndex: index + 1,
    dayLabel,
    meals: [meals[index]!],
  }));
}

export function addDaysToIsoDate(startIso: string, days: number): string {
  const d = new Date(`${startIso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
