import type { Metadata } from "next";

import { AppExperience } from "@/components/layout/app-experience";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppThemeBar } from "@/components/layout/app-theme-bar";

export const metadata: Metadata = {
  title: "Início",
  robots: { index: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppExperience>
      <div className="flex min-h-full flex-col bg-muted/20">
        <AppThemeBar />
        <div className="flex flex-1 flex-col md:flex-row">
          <AppSidebar />
          <main
            id="main-content"
            className="flex-1 p-4 pb-24 md:p-8 md:pb-8"
            tabIndex={-1}
          >
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AppExperience>
  );
}
