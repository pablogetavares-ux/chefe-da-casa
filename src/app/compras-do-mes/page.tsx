import dynamic from "next/dynamic";

import { PanelSkeleton } from "@/components/shared/panel-skeleton";

const MonthlyPurchasesPanel = dynamic(
  () =>
    import("@/modules/monthly-purchases/components/monthly-purchases-panel").then(
      (mod) => mod.MonthlyPurchasesPanel,
    ),
  {
    loading: () => (
      <PanelSkeleton rows={5} label="Carregando compras do mês..." />
    ),
  },
);

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

function parsePeriod(monthRaw?: string, yearRaw?: string) {
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year) ||
    year < 2020 ||
    year > 2100
  ) {
    return undefined;
  }
  return { month, year };
}

export default async function ComprasDoMesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parsePeriod(params.month, params.year);

  return (
    <MonthlyPurchasesPanel
      initialMonth={period?.month}
      initialYear={period?.year}
    />
  );
}
