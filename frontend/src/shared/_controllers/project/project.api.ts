import "server-only";

import type {
  ProjectDetailResponse,
  ProjectOrderRequest,
  ProjectSaveRequest,
  ProjectSummaryResponse,
  SlugCheckResponse,
} from "@/shared/_generated";
import type {
  DeleteProjectPath,
  GetProjectByIdPath,
  GetProjectBySlugPath,
  IsProjectSlugAvailableQuery,
  UpdateProjectPath,
} from "@/shared/_generated";
import { publicApiClient, adminApiClient } from "@/shared/libs/api/client";

export type CreateProjectBody = ProjectSaveRequest;
export type CreateProjectResponse = ProjectDetailResponse;
export type DeleteProjectPathParams = DeleteProjectPath;
export type DeleteProjectResponse = unknown;
export type GetProjectByIdPathParams = GetProjectByIdPath;
export type GetProjectByIdResponse = ProjectDetailResponse;
export type GetProjectBySlugPathParams = GetProjectBySlugPath;
export type GetProjectBySlugResponse = ProjectDetailResponse;
export type GetProjectSummariesResponse = ProjectSummaryResponse[];
export type IsProjectSlugAvailableQueryParams = IsProjectSlugAvailableQuery;
export type IsProjectSlugAvailableResponse = SlugCheckResponse;
export type UpdateProjectBody = ProjectSaveRequest;
export type UpdateProjectPathParams = UpdateProjectPath;
export type UpdateProjectResponse = ProjectDetailResponse;
export type UpdateProjectOrderBody = ProjectOrderRequest;
export type UpdateProjectOrderResponse = unknown;

export async function createProject(body: CreateProjectBody) {
  return adminApiClient<CreateProjectResponse>("/api/admin/projects", {
    method: "POST",
    body,
  });
}

export async function deleteProject(params: DeleteProjectPathParams) {
  return adminApiClient<DeleteProjectResponse>(`/api/admin/projects/${params.projectId}`, {
    method: "DELETE",
  });
}

export async function getProjectById(params: GetProjectByIdPathParams) {
  return adminApiClient<GetProjectByIdResponse>(`/api/admin/projects/${params.projectId}`, {
    method: "GET",
  });
}

export async function getProjectBySlug(params: GetProjectBySlugPathParams) {
  return publicApiClient<GetProjectBySlugResponse>(`/api/projects/slug/${params.slug}`, {
    method: "GET",
  });
}

export async function getProjectSummaries() {
  return publicApiClient<GetProjectSummariesResponse>("/api/projects", {
    method: "GET",
  });
}

export async function isProjectSlugAvailable(params: IsProjectSlugAvailableQueryParams) {
  return adminApiClient<IsProjectSlugAvailableResponse>("/api/admin/projects/slug-check", {
    method: "GET",
    query: params,
  });
}

export async function updateProject(params: UpdateProjectPathParams, body: UpdateProjectBody) {
  return adminApiClient<UpdateProjectResponse>(`/api/admin/projects/${params.projectId}`, {
    method: "PUT",
    body,
  });
}

export async function updateProjectOrder(body: UpdateProjectOrderBody) {
  return adminApiClient<UpdateProjectOrderResponse>("/api/admin/projects/order", {
    method: "PUT",
    body,
  });
}
