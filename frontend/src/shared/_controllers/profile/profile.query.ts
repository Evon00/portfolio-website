"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { ProfileView } from "./profile.types";

export function useProfileQuery() {
  return useQuery({
    queryKey: adminQueryKeys.profile.all,
    queryFn: () => adminFetch<ProfileView>("/api/admin/profile"),
  });
}
