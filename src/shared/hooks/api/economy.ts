import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { ECONOMY_DASHBOARD_QUERY_KEY } from "@/shared/hooks/api/query-keys";
import { useAuthQueryEnabled } from "@/shared/hooks/use-auth-query-enabled";

export function useEconomyDashboard() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: ECONOMY_DASHBOARD_QUERY_KEY,
    queryFn: () => api.economy.dashboard(),
    staleTime: 2 * 60_000,
    enabled,
  });
}
