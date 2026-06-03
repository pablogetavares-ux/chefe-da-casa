import { describe, expect, it } from "vitest";

import {
  buildWeeklyDayTemplates,
  WEEKLY_PLAN_GOAL_LABELS,
} from "@/lib/weekly-plan/meal-templates";

describe("buildWeeklyDayTemplates", () => {
  it("gera 7 dias para cada objetivo", () => {
    for (const goal of Object.keys(WEEKLY_PLAN_GOAL_LABELS) as Array<
      keyof typeof WEEKLY_PLAN_GOAL_LABELS
    >) {
      const days = buildWeeklyDayTemplates(goal);
      expect(days).toHaveLength(7);
      expect(days[0]?.meals).toHaveLength(1);
      expect(days[6]?.dayLabel).toMatch(/Domingo/);
    }
  });
});
