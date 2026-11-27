"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { DashboardView } from "./stats.types";

/** 대시보드 한 장. Route Handler가 Spring 통계 API 4개를 함께 불러 합친다. */
export function useDashboardQuery() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.all,
    queryFn: () => adminFetch<DashboardView>("/api/admin/dashboard"),
  });
}
