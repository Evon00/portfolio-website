"use client";

import { use } from "react";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { useProjectDetailQuery } from "@/shared/_controllers/project";
import { ProjectForm } from "./project-form";

// 수정 화면: 프로젝트를 불러온 뒤 폼을 그린다(폼 state의 초기값).
export function ProjectEdit({ params }: { params: Promise<{ id: string }> }) {
  const projectId = Number(use(params).id);
  const { data, isPending, isError, refetch } = useProjectDetailQuery(projectId);
  if (isPending) return <AdminLoading />;
  if (isError) return <AdminLoadError onRetry={() => refetch()} />;
  return <ProjectForm key={data.projectId} project={data} />;
}
