import { fetchHomeFeed } from "@/modules/home/services/home-feed";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { HomePremiumPanel } from "@/modules/home/components/home-premium-panel";

export default async function AppDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/app");
  }

  const initialData = await fetchHomeFeed(supabase, user.id);

  return <HomePremiumPanel initialData={initialData} />;
}
