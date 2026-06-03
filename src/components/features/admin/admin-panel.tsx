"use client";

import { useState } from "react";

import { AdminActivityPanel } from "@/components/features/admin/admin-activity-panel";
import { AdminOverviewPanel } from "@/components/features/admin/admin-dashboard-panel";
import { AdminOffersPanel } from "@/components/features/admin/admin-offers-panel";
import { AdminShell } from "@/components/features/admin/admin-shell";
import { AdminSystemPanel } from "@/components/features/admin/admin-system-panel";
import { AdminUsersPanel } from "@/components/features/admin/admin-users-panel";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedPage } from "@/components/shared/motion";
import type { AdminTabId } from "@/modules/admin/types";

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTabId>("overview");

  return (
    <AnimatedPage>
      <PageHeader
        title="Painel Admin"
        description="Gestão da plataforma — usuários, ofertas regionais, atividade e saúde do sistema."
      />

      <AdminShell activeTab={tab} onTabChange={setTab}>
        {tab === "overview" ? <AdminOverviewPanel /> : null}
        {tab === "users" ? <AdminUsersPanel /> : null}
        {tab === "offers" ? <AdminOffersPanel /> : null}
        {tab === "activity" ? <AdminActivityPanel /> : null}
        {tab === "system" ? <AdminSystemPanel /> : null}
      </AdminShell>
    </AnimatedPage>
  );
}
