import type { Metadata } from "next";

import { AppExperience } from "@/components/layout/app-experience";
import { AppSidebar } from "@/components/layout/app-sidebar";

export const metadata: Metadata = {
  title: "Compras do Mês",
  description:
    "Registre compras recorrentes do mês e acompanhe quanto você gasta no supermercado e na feira.",
  robots: { index: false },
};

export default function ComprasDoMesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppExperience>
      <div className="flex min-h-full flex-col bg-muted/20 md:flex-row">
        <AppSidebar />
        <main
          id="main-content"
          className="flex-1 p-4 pb-24 md:p-8 md:pb-8"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </AppExperience>
  );
}
