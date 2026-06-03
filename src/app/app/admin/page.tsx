import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { PanelSkeleton } from "@/components/shared/panel-skeleton";
import { isAdminAny } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const AdminPanel = dynamic(
  () =>
    import("@/components/features/admin/admin-panel").then(
      (mod) => mod.AdminPanel,
    ),
  { loading: () => <PanelSkeleton rows={6} label="Carregando admin..." /> },
);

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  if (!user || !isAdminAny(user.email, profile?.email)) {
    redirect("/app");
  }

  return <AdminPanel />;
}
