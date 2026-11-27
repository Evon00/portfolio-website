"use server";

import type { ProjectOrderRequest, ProjectSaveRequest } from "@/shared/_generated";
import { invalidateProject } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { createProject, deleteProject, updateProject, updateProjectOrder } from "./project.service";

// 어드민 프로젝트 저장·삭제·순서. 성공하면 공개 페이지 캐시(project-<id>, projects)를 비운다(설계 문서 6절).

export async function createProjectAction(request: ProjectSaveRequest) {
  return withAdminAction(async () => {
    const project = await createProject(request);
    invalidateProject(project.projectId);
    return project;
  });
}

export async function updateProjectAction(projectId: number, request: ProjectSaveRequest) {
  return withAdminAction(async () => {
    const project = await updateProject({ projectId }, request);
    invalidateProject(projectId);
    return project;
  });
}

export async function deleteProjectAction(projectId: number) {
  return withAdminAction(async () => {
    await deleteProject({ projectId });
    invalidateProject(projectId);
    return null;
  });
}

/** 순서·주요 프로젝트는 목록과 메인 캐러셀에만 쓰이므로 projects 태그만 비운다. */
export async function updateProjectOrderAction(request: ProjectOrderRequest) {
  return withAdminAction(async () => {
    await updateProjectOrder(request);
    invalidateProject();
    return null;
  });
}
