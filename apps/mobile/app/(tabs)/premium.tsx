import { PaywallScreen } from "@/modules/billing";
import { useAuth } from "@/providers/AuthProvider";

export default function PremiumTab() {
  const { user } = useAuth();
  return <PaywallScreen userId={user?.id} />;
}
