import { logoutAction } from "@/lib/actions/auth";
import { isAdminAny } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import { AppNavClient } from "./app-nav-client";

export async function AppSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, plan, email")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <AppNavClient
      userName={profile?.full_name}
      userEmail={user?.email}
      plan={profile?.plan}
      isAdmin={isAdminAny(user?.email, profile?.email)}
      logoutAction={logoutAction}
    />
  );
}
