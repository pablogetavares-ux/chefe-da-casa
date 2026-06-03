import { redirect } from "next/navigation";

import { MonthlyPurchasesPanel } from "@/modules/monthly-purchases/components/monthly-purchases-panel";

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
    return null;
  }
  return { month, year };
}

export default async function ComprasDoMesHistoricoConsultaPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const period = parsePeriod(params.month, params.year);

  if (!period) {
    redirect("/compras-do-mes/historico");
  }

  return (
    <MonthlyPurchasesPanel
      readOnly
      initialMonth={period.month}
      initialYear={period.year}
      backHref="/compras-do-mes/historico"
      backLabel="Voltar ao histórico"
    />
  );
}
