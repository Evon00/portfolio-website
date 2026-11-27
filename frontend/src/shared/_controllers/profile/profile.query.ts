"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { ProfileResponse } from "@/shared/_generated";

export function useProfileQuery() {
  return useQuery({
    queryKey: adminQueryKeys.profile.all,
    queryFn: () => adminFetch<ProfileResponse>("/api/admin/profile"),
  });
}
