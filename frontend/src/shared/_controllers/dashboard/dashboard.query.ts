"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { DashboardResponse } from "@/shared/_controllers/_legacy-types";

export function useDashboardQuery() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.all,
    queryFn: () => adminFetch<DashboardResponse>("/api/admin/dashboard"),
  });
}
