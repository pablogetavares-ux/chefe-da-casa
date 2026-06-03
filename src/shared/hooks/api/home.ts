"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { HomeFeedResponse } from "@/modules/home/types";
import { homeFeedQueryKey } from "@/shared/hooks/api/query-keys";
import { useAuthQueryEnabled } from "@/shared/hooks/use-auth-query-enabled";

export { homeFeedQueryKey } from "@/shared/hooks/api/query-keys";

export function useHomeFeed(city?: string, initialData?: HomeFeedResponse) {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: homeFeedQueryKey(city),
    queryFn: () => api.home.feed(city),
    initialData,
    staleTime: 60_000,
    enabled,
  });
}
