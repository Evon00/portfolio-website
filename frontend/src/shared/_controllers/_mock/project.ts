import "server-only";

import { ApiError } from "@/shared/libs/api";
import type {
  DeleteProjectPath,
  GetProjectByIdPath,
  GetProjectBySlugPath,
  IsProjectSlugAvailableQuery,
  ProjectDetailResponse,
  ProjectOrderRequest,
  ProjectSaveRequest,
  ProjectSummaryResponse,
  SlugCheckResponse,
  UpdateProjectPath,
} from "@/shared/_controllers/_legacy-types";
import { type MockProject, mockDb, mockDelay, nextMockId, resolveSkills } from "./store";

// 프로젝트 목 구현(서버 메모리). 인자 · 반환 모양은 project/project.api.ts(실제 구현)와 같다(data-source.server.ts의 satisfies가 확인한다).
// data-source.server.ts가 이 파일을 고른다. Spring 연결 때 project/project.api.ts로 바꾸면 이 파일은 지운다.

function toDetail({ skillIds, featured: _featured, ...project }: MockProject): ProjectDetailResponse {
  return { ...project, skills: resolveSkills(skillIds) };
}

function toSummary({ content: _content, images, skillIds, ...project }: MockProject): ProjectSummaryResponse {
  return {
    ...project,
    thumbnailUrl: images[0]?.url ?? null,
    imageCount: images.length,
    skills: resolveSkills(skillIds),
  };
}

function findProject(projectId: number) {
  const project = mockDb.projects.find((item) => item.projectId === projectId);
  if (!project) throw new ApiError({ status: 404, message: "프로젝트를 찾을 수 없어요." });
  return project;
}

function toImages(request: ProjectSaveRequest): MockProject["images"] {
  return request.images.map(({ imageId, url, caption }) => ({ imageId, url, caption: caption?.trim() || null }));
}

/** 전체 프로젝트 요약. 순서는 서버가 정한다(displayOrder, 설계 문서 16-1절). GET /api/projects */
export async function getProjectSummaries(): Promise<ProjectSummaryResponse[]> {
  await mockDelay();
  return mockDb.projects.map(toSummary);
}

/** 프로젝트 상세. GET /api/projects/slug/{slug} · 없으면 404 */
export async function getProjectBySlug({ slug }: GetProjectBySlugPath): Promise<ProjectDetailResponse> {
  await mockDelay();
  const project = mockDb.projects.find((item) => item.slug === slug);
  if (!project) throw new ApiError({ status: 404, message: "프로젝트를 찾을 수 없어요." });
  return toDetail(project);
}

// ── 어드민 ──

/** 수정 화면. GET /api/admin/projects/{projectId} */
export async function getProjectById({ projectId }: GetProjectByIdPath): Promise<ProjectDetailResponse> {
  await mockDelay();
  return toDetail(findProject(projectId));
}

/** 슬러그 중복 확인. GET /api/admin/projects/slug-check?slug= */
export async function isProjectSlugAvailable({ slug }: IsProjectSlugAvailableQuery): Promise<SlugCheckResponse> {
  await mockDelay();
  return { available: !mockDb.projects.some((project) => project.slug === slug) };
}

/** 등록. POST /api/admin/projects · 새 프로젝트는 목록 맨 뒤, 주요 프로젝트가 아닌 상태로 들어간다 */
export async function createProject(request: ProjectSaveRequest): Promise<ProjectDetailResponse> {
  await mockDelay();
  if (!(await isProjectSlugAvailable({ slug: request.slug })).available) {
    throw new ApiError({ status: 409, message: "이미 쓰고 있는 슬러그예요." });
  }
  const { skillIds, images: _images, ...fields } = request;
  const project: MockProject = {
    ...fields,
    projectId: nextMockId(),
    images: toImages(request),
    featured: false,
    skillIds,
  };
  mockDb.projects.push(project);
  return toDetail(project);
}

/** 수정. PUT /api/admin/projects/{projectId} · 슬러그는 바꾸지 않는다 */
export async function updateProject(
  { projectId }: UpdateProjectPath,
  request: ProjectSaveRequest,
): Promise<ProjectDetailResponse> {
  await mockDelay();
  const project = findProject(projectId);
  const { slug: _slug, skillIds, images: _images, ...fields } = request;
  Object.assign(project, { ...fields, skillIds, images: toImages(request) });
  return toDetail(project);
}

/** 삭제. DELETE /api/admin/projects/{projectId} */
export async function deleteProject({ projectId }: DeleteProjectPath) {
  await mockDelay();
  findProject(projectId);
  mockDb.projects = mockDb.projects.filter((project) => project.projectId !== projectId);
}

/** 노출 순서·주요 프로젝트 저장. PUT /api/admin/projects/order */
export async function updateProjectOrder({ items }: ProjectOrderRequest) {
  await mockDelay();
  if (items.length !== mockDb.projects.length) {
    throw new ApiError({ status: 409, message: "그사이 프로젝트가 바뀌었어요. 새로고침한 뒤 다시 정해 주세요." });
  }
  mockDb.projects = items.map(({ projectId, featured }) => ({ ...findProject(projectId), featured }));
}
