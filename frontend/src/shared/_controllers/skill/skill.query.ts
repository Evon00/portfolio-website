"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { SkillResponse } from "@/shared/_controllers/_legacy-types";

export function useSkillListQuery() {
  return useQuery({
    queryKey: adminQueryKeys.skills.lists(),
    queryFn: () => adminFetch<SkillResponse[]>("/api/admin/skills"),
  });
}
