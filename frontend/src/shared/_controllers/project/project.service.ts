import "server-only";

import { project } from "@/shared/_controllers/data-source.server";

// 프로젝트 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(지금은 _mock/project.ts, Spring 연결 후 project.api.ts). 주석의 경로는 예정 엔드포인트다.

/** 전체 프로젝트 요약. 순서는 서버가 정한다(displayOrder, 설계 문서 16-1절). GET /api/projects */
export const getProjectSummaries = project.getProjectSummaries;

/** 프로젝트 상세. GET /api/projects/slug/{slug} · 없으면 404(project.cached.ts가 null로 바꾼다) */
export const getProjectBySlug = project.getProjectBySlug;

/** 수정 화면. GET /api/admin/projects/{projectId} */
export const getProjectById = project.getProjectById;

/** 슬러그 중복 확인. GET /api/admin/projects/slug-check?slug= */
export const isProjectSlugAvailable = project.isProjectSlugAvailable;

/** 등록. POST /api/admin/projects · 새 프로젝트는 목록 맨 뒤, 주요 프로젝트가 아닌 상태로 들어간다 */
export const createProject = project.createProject;

/** 수정. PUT /api/admin/projects/{projectId} · 슬러그는 바꾸지 않는다 */
export const updateProject = project.updateProject;

/** 삭제. DELETE /api/admin/projects/{projectId} */
export const deleteProject = project.deleteProject;

/** 노출 순서·주요 프로젝트 저장. PUT /api/admin/projects/order */
export const updateProjectOrder = project.updateProjectOrder;
