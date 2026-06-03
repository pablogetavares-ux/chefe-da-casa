export const FITNESS_GOALS = [
  "lose_weight",
  "gain_muscle",
  "maintain",
] as const;

export type FitnessGoalType = (typeof FITNESS_GOALS)[number];

export const FITNESS_GOAL_LABELS: Record<
  FitnessGoalType,
  { label: string; description: string }
> = {
  lose_weight: {
    label: "Perder peso",
    description: "Déficit calórico moderado e proteína elevada",
  },
  gain_muscle: {
    label: "Ganhar massa",
    description: "Superávit leve com foco em proteínas",
  },
  maintain: {
    label: "Manter peso",
    description: "Equilíbrio calórico e macros estáveis",
  },
};
