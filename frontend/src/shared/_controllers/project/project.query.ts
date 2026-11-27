"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { ProjectDetailResponse, ProjectSummaryResponse } from "@/shared/_generated";

// 어드민 프로젝트 조회 (라우트 핸들러). 저장·삭제·순서는 project.action.ts의 서버 액션을 쓴다.
export function useProjectListQuery() {
  return useQuery({
    queryKey: adminQueryKeys.projects.lists(),
    queryFn: () => adminFetch<ProjectSummaryResponse[]>("/api/admin/projects"),
  });
}

export function useProjectDetailQuery(projectId: number) {
  return useQuery({
    queryKey: adminQueryKeys.projects.detail(projectId),
    queryFn: () => adminFetch<ProjectDetailResponse>(`/api/admin/projects/${projectId}`),
  });
}
