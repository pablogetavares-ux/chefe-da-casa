"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

export const ADMIN_ACCESS_KEY = ["admin-access"] as const;
export const ADMIN_STATS_KEY = ["admin-stats"] as const;

export function useAdminAccess() {
  return useQuery({
    queryKey: ADMIN_ACCESS_KEY,
    queryFn: api.admin.access,
    staleTime: 60_000,
    retry: false,
  });
}
export const ADMIN_USERS_KEY = "admin-users";
export const ADMIN_OFFERS_KEY = "admin-offers";
export const ADMIN_ACTIVITY_KEY = ["admin-activity"] as const;
export const ADMIN_LAUNCH_KEY = ["admin-launch"] as const;

export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_STATS_KEY,
    queryFn: api.admin.stats,
    retry: false,
  });
}

export function useAdminUsers(params: {
  page: number;
  limit?: number;
  q?: string;
}) {
  return useQuery({
    queryKey: [
      ADMIN_USERS_KEY,
      params.page,
      params.limit ?? 20,
      params.q ?? "",
    ],
    queryFn: () =>
      api.admin.users({
        page: params.page,
        limit: params.limit ?? 20,
        q: params.q,
      }),
    retry: false,
  });
}

export function useAdminOffers(params: {
  page: number;
  limit?: number;
  q?: string;
}) {
  return useQuery({
    queryKey: [
      ADMIN_OFFERS_KEY,
      params.page,
      params.limit ?? 20,
      params.q ?? "",
    ],
    queryFn: () =>
      api.admin.offers({
        page: params.page,
        limit: params.limit ?? 20,
        q: params.q,
      }),
    retry: false,
  });
}

export function useAdminActivity(limit = 40) {
  return useQuery({
    queryKey: [...ADMIN_ACTIVITY_KEY, limit],
    queryFn: () => api.admin.activity(limit),
    retry: false,
  });
}

export function useAdminLaunchChecklist() {
  return useQuery({
    queryKey: ADMIN_LAUNCH_KEY,
    queryFn: api.admin.launchChecklist,
    retry: false,
  });
}
