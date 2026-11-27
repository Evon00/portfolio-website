import "server-only";

import { project } from "@/shared/_controllers/data-source.server";

// 프로젝트 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(project.api.ts).

/** 공개 목록(페이지). 노출 순서(projectPriority)대로. GET /api/project */
export const findAllProjects = project.findAllProjects;

/** 공개 상세. GET /api/project/{projectSlug} · 없으면 404(project.cached.ts가 null로 바꾼다) */
export const findProjectBySlug = project.findProjectBySlug;

/** 어드민 목록(페이지). GET /api/admin/project */
export const findAllAdminProjects = project.findAllAdminProjects;

/** 수정 화면. GET /api/admin/project/{projectId} */
export const findProject = project.findProject;

/** 슬러그 중복 확인. GET /api/admin/project/slug/check?projectSlug= */
export const checkProjectSlug = project.checkProjectSlug;

/** 등록(multipart: data + files). POST /api/admin/project · 새 프로젝트는 목록 맨 뒤 */
export const createProject = project.createProject;

/** 수정(multipart, 바뀐 필드만). PATCH /api/admin/project/{projectId} · 슬러그는 바꾸지 않는다 */
export const updateProject = project.updateProject;

/** 한 프로젝트를 전체 목록의 한 위치로 옮긴다. PATCH /api/admin/project/{projectId}/priority */
export const updateProjectPriority = project.updateProjectPriority;

/** 삭제. DELETE /api/admin/project/{projectId} */
export const deleteProject = project.deleteProject;
