import { router } from "expo-router";

import { PaywallScreen } from "@/modules/billing";
import { useAuth } from "@/providers/AuthProvider";

export default function PaywallModal() {
  const { user } = useAuth();
  return <PaywallScreen userId={user?.id} onClose={() => router.back()} />;
}
