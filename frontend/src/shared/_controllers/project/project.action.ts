"use server";

import { invalidateProject } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { createProject, deleteProject, updateProject, updateProjectPriority } from "./project.service";

// 어드민 프로젝트 저장·삭제·순서. 성공하면 공개 페이지 캐시(project-<id>, projects)를 비운다(설계 문서 6절).
// 갤러리 이미지는 저장 요청에 함께 보낸다. 화면은 FormData(data: JSON 문자열, files: 새 이미지들)로 보내고,
// 여기서 Spring multipart(data 파트 application/json + files 파트)로 바꾼다. projectMedias의 fileIndex가 files 순서다.

function toSpringMultipart(form: FormData) {
  const body = new FormData();
  body.append("data", new Blob([String(form.get("data") ?? "{}")], { type: "application/json" }));
  for (const file of form.getAll("files")) {
    if (file instanceof Blob && file.size > 0) body.append("files", file);
  }
  return body;
}

/** form: data(CreateProjectRequestDto JSON) + files */
export async function createProjectAction(form: FormData) {
  return withAdminAction(async () => {
    const project = await createProject(toSpringMultipart(form));
    invalidateProject(project.projectId);
    return project;
  });
}

/** form: data(UpdateProjectRequestDto JSON, 바뀐 필드만) + files(새 이미지만) */
export async function updateProjectAction(projectId: number, form: FormData) {
  return withAdminAction(async () => {
    const project = await updateProject({ projectId }, toSpringMultipart(form));
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

/**
 * 노출 순서 저장. 이동(projectId → 위치)을 차례로 보낸다(project.types.ts의 toPriorityMoves).
 * 중간에 실패해도 앞의 이동은 이미 저장됐으므로 캐시는 항상 비운다. 순서는 목록과 메인 캐러셀에만 쓰여 projects 태그만 비운다.
 */
export async function updateProjectOrderAction(moves: { projectId: number; position: number }[]) {
  return withAdminAction(async () => {
    try {
      for (const { projectId, position } of moves) {
        await updateProjectPriority({ projectId }, { projectPriority: position });
      }
    } finally {
      invalidateProject();
    }
    return null;
  });
}
